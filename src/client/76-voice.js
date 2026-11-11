/* 76-voice.js — 麦克风采集与转写（闪念胶囊语音入口的真源）
 *
 * 背景（v1.8）：v1.7 之前胶囊的「语音」只有 `window.SpeechRecognition`——
 * 那是 Chromium 的可选云识别组件，Electron 宿主默认不带 Google 语音服务，
 * 取不到构造器就直接 toast 返回，等于没有语音录入。
 *
 * 现在按 DSH 官方语音输入（@deepseek-ai/dsh-experimental-client-ui-voice-input）
 * 的同一条链路补齐，采集与识别彻底分开：
 *   ① 采集：`getUserMedia` + `MediaRecorder`（Chromium 原生，非宿主 API）；
 *   ② 重采样：`decodeAudioData` → `OfflineAudioContext(1, n, 16000)`；
 *   ③ 封装：PCM16 单声道 WAV（44 字节头），16 kHz；
 *   ④ 识别：优先 DSH 的 `ctx.remote.speech.transcribe`（SenseVoice 本地跑，
 *      离线、无配额），拿不到就降级走插件代理的 `POST /asr`（腾讯云）。
 *
 * ⚠️ 为什么必须到 16 kHz 单声道 PCM16：Host 侧 `validateWave()` 只认这一种，
 *    `maxAudioBytes` 默认 4MB、`maxDurationSeconds` 默认 120。16k/16bit 单声道
 *    60s ≈ 1.92MB，正好卡在「代理 2MB」之外、Host 4MB 之内 ⇒ index.js 的代理
 *    上限本轮从 2MB 提到 8MB。
 * ⚠️ 麦克风权限不在插件手里：DSH 主进程 `installMicrophonePermissions` 只对
 *    「主窗口主框架 + mediaTypes 恰为 ['audio']」放行。所以 `getUserMedia`
 *    必须保持 `{ audio: true }` 这一种形状，别顺手加 video / 多轨。
 */
;(function (AT, React, h) {
  'use strict'

  var SAMPLE_RATE = 16000
  var MAX_SECONDS = 60
  var TAIL_MS = 800          /* MediaRecorder.onstop 偶发不回时的兜底 */
  var FLUSH_BYTES = 0x8000   /* base64 分块，避免 apply 爆栈 */

  var capture = null         /* { stream, ctx, recorder, chunks, dead } */
  var remote = null          /* ctx.remote（命名空间 speech） */
  var catalogCache = null    /* 最近一次 speech/catalog 的快照 */

  function recError(kind, message) {
    var err = new Error(message || kind)
    err.kind = kind
    return err
  }

  /* ------------------------------------------------------------- 采集 --- */
  function supported() {
    return !!(typeof navigator !== 'undefined' && navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      typeof window !== 'undefined' && typeof window.MediaRecorder !== 'undefined')
  }

  function recording() { return !!capture }

  async function start() {
    if (!supported()) throw recError('unavailable', '当前宿主没有可用的麦克风接口')
    await abort()
    var stream
    try {
      /* ⚠️ 形状不能改：宿主只放行 mediaTypes === ['audio'] 的主框架请求。 */
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      })
    } catch (e) {
      var name = (e && e.name) || ''
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        throw recError('permission', '麦克风权限被拒绝')
      }
      if (name === 'NotFoundError' || name === 'OverconstrainedError' || name === 'NotReadableError') {
        throw recError('deviceMissing', '没有找到可用的麦克风')
      }
      throw recError('unavailable', (e && e.message) || '无法打开麦克风')
    }
    var Ctx = window.AudioContext || window.webkitAudioContext
    var ctx = null, recorder = null
    try {
      ctx = new Ctx()
      if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
        try { await ctx.resume() } catch (e) { /* 让 decode 阶段再暴露问题 */ }
      }
      recorder = new window.MediaRecorder(stream)
    } catch (e) {
      try { stream.getTracks().forEach(function (t) { t.stop() }) } catch (err) {}
      throw recError('unavailable', (e && e.message) || '无法启动录音')
    }
    var job = { stream: stream, ctx: ctx, recorder: recorder, chunks: [], dead: false }
    recorder.ondataavailable = function (event) {
      if (event && event.data && event.data.size > 0) job.chunks.push(event.data)
    }
    recorder.onerror = function () { job.dead = true }
    /* 拔设备 / 系统收回麦克风：tracks 的 ended 是最早的信号 */
    stream.getTracks().forEach(function (track) {
      if (track && typeof track.addEventListener === 'function') {
        track.addEventListener('ended', function () { job.dead = true })
      }
    })
    try {
      recorder.start()
    } catch (e) {
      release(job)
      throw recError('unavailable', (e && e.message) || '无法开始录音')
    }
    capture = job
    return true
  }

  function closeCtx(ctx) {
    if (!ctx || typeof ctx.close !== 'function') return Promise.resolve()
    try { return Promise.resolve(ctx.close()).catch(function () {}) } catch (e) { return Promise.resolve() }
  }

  function release(job) {
    if (!job) return Promise.resolve()
    try {
      job.stream.getTracks().forEach(function (t) { try { t.stop() } catch (e) {} })
    } catch (e) {}
    return closeCtx(job.ctx)
  }

  /** 放弃这次采集：不产出音频，不识别。关闭抽屉 / 卸载时走这里。 */
  function abort() {
    var job = capture
    capture = null
    if (!job) return Promise.resolve()
    try {
      if (job.recorder && job.recorder.state !== 'inactive') job.recorder.stop()
    } catch (e) {}
    return release(job)
  }

  /**
   * 结束采集并重采样成 16 kHz 单声道 PCM16 WAV。
   * @param {number} [maxSec] 截断上限（Host 的 maxDurationSeconds 也有一道）
   * @returns {Promise<{bytes: Uint8Array, seconds: number}>}
   */
  async function stop(maxSec) {
    var job = capture
    capture = null
    if (!job) throw recError('empty', '这次没有录到音频')
    var limit = Math.max(1, Math.min(Number(maxSec) || MAX_SECONDS, MAX_SECONDS))
    var recorder = job.recorder
    try {
      if (recorder && recorder.state === 'recording') {
        await new Promise(function (resolve) {
          var done = false
          function finish() { if (!done) { done = true; resolve() } }
          recorder.onstop = finish
          setTimeout(finish, TAIL_MS)
          try { recorder.stop() } catch (e) { finish() }
        })
      }
    } finally {
      try { job.stream.getTracks().forEach(function (t) { try { t.stop() } catch (e) {} }) } catch (e) {}
    }
    var blob = new Blob(job.chunks, { type: (recorder && recorder.mimeType) || 'audio/webm' })
    if (!blob.size) {
      await closeCtx(job.ctx)
      throw recError('empty', '这次没有录到音频')
    }
    var decoded
    try {
      decoded = await job.ctx.decodeAudioData(await blob.arrayBuffer())
    } catch (e) {
      await closeCtx(job.ctx)
      throw recError('empty', '音频解析失败')
    }
    var frames = Math.max(1, Math.floor(Math.min(decoded.duration, limit) * SAMPLE_RATE))
    var Offline = window.OfflineAudioContext || window.webkitOfflineAudioContext
    var samples
    try {
      var offline = new Offline(1, frames, SAMPLE_RATE)
      var source = offline.createBufferSource()
      source.buffer = decoded
      source.connect(offline.destination)
      source.start()
      var rendered = await offline.startRendering()
      samples = rendered.getChannelData(0)
    } catch (e) {
      await closeCtx(job.ctx)
      throw recError('empty', '音频重采样失败')
    }
    await closeCtx(job.ctx)
    return { bytes: encodeWave(samples), seconds: frames / SAMPLE_RATE }
  }

  /* ------------------------------------------------------- WAV / base64 --- */
  /** 单声道浮点样本 → 规范 PCM16 WAV（与 Host `validateWave` 同一格式）。 */
  function encodeWave(samples) {
    var bytes = new Uint8Array(44 + samples.length * 2)
    var view = new DataView(bytes.buffer)
    function text(at, value) {
      for (var i = 0; i < value.length; i++) bytes[at + i] = value.charCodeAt(i)
    }
    text(0, 'RIFF')
    view.setUint32(4, bytes.length - 8, true)
    text(8, 'WAVE')
    text(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)        /* PCM */
    view.setUint16(22, 1, true)        /* 单声道 */
    view.setUint32(24, SAMPLE_RATE, true)
    view.setUint32(28, SAMPLE_RATE * 2, true)
    view.setUint16(32, 2, true)        /* block align */
    view.setUint16(34, 16, true)       /* bit depth */
    text(36, 'data')
    view.setUint32(40, samples.length * 2, true)
    for (var i = 0; i < samples.length; i++) {
      var value = Math.max(-1, Math.min(1, samples[i]))
      view.setInt16(44 + i * 2, Math.round(value * (value < 0 ? 32768 : 32767)), true)
    }
    return bytes
  }

  function toBase64(bytes) {
    var out = '', i
    for (i = 0; i < bytes.length; i += FLUSH_BYTES) {
      out += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + FLUSH_BYTES, bytes.length)))
    }
    return window.btoa(out)
  }

  /* --------------------------------------------------------- 转写链路 --- */
  /** 挂上宿主 remote（由 99-entry 在 `remote` 服务可用时调用）。 */
  function attach(remoteApi) {
    remote = remoteApi || null
    catalogCache = null
  }

  function pickFrom(cat) {
    var providers = (cat && cat.providers) || []
    var chosen = (cat && cat.selection) || {}
    var provider = null, i
    for (i = 0; i < providers.length; i++) {
      if (chosen.providerId && providers[i].id === chosen.providerId) provider = providers[i]
    }
    if (!provider && providers.length) provider = providers[0]
    var request = {}
    if (provider) request.providerId = provider.id
    if (chosen.language) request.language = chosen.language
    else if (provider && provider.languages && provider.languages.length === 1) request.language = provider.languages[0]
    var ready = !!(provider && provider.preparation && provider.preparation.phase === 'ready')
    return { ready: ready, request: request, provider: provider }
  }

  async function selection() {
    if (catalogCache) return pickFrom(catalogCache)
    if (!remote || !remote.speech || typeof remote.speech.catalog !== 'function') {
      return { ready: false, request: {}, provider: null }
    }
    try {
      var res = await remote.speech.catalog()
      if (res && res.ok && res.value) catalogCache = res.value
    } catch (e) { /* 目录读不到就当作「本地未就绪」 */ }
    return pickFrom(catalogCache)
  }

  /**
   * 一段 WAV → 文字。本地优先、后端兜底。
   * @returns {Promise<{text: string, via: 'local'|'server'}>}
   */
  async function transcribe(bytes, signal) {
    var problems = []
    var local = await selection()
    if (local.ready && remote && remote.speech && typeof remote.speech.transcribe === 'function') {
      try {
        var request = Object.assign({ audioBase64: toBase64(bytes) }, local.request)
        var res = await remote.speech.transcribe(request, signal)
        if (res && res.ok) return { text: (res.value && res.value.text) || '', via: 'local' }
        problems.push((res && res.error && res.error.message) || '本地识别未成功')
      } catch (e) {
        if (signal && signal.aborted) throw e
        problems.push((e && e.message) || '本地识别未成功')
      }
    } else if (remote && remote.speech) {
      problems.push('DSH 语音模型还没准备好')
    }

    var B = AT.bridge
    if (B && typeof B.asr === 'function') {
      try {
        var data = await B.asr(new Blob([bytes], { type: 'audio/wav' }), 'wav')
        return { text: (data && data.text) || '', via: 'server' }
      } catch (e) {
        problems.push((e && e.message) || '后端识别未成功')
      }
    } else {
      problems.push('没有可用的识别通道')
    }
    throw recError('transcribe', problems.join('；'))
  }

  /* 宿主侧语音目录的即时状态，供 UI 决定提示语（不阻塞录音）。 */
  function localReady() {
    if (!catalogCache) return false
    return pickFrom(catalogCache).ready
  }

  AT.voice = {
    SAMPLE_RATE: SAMPLE_RATE,
    MAX_SECONDS: MAX_SECONDS,
    supported: supported,
    recording: recording,
    start: start,
    stop: stop,
    abort: abort,
    attach: attach,
    transcribe: transcribe,
    localReady: localReady,
    encodeWave: encodeWave,
    toBase64: toBase64
  }
})(AT, React, h)
