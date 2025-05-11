import React, { useRef, useState, useEffect } from 'react'
import { Play, Pause } from 'lucide-react'

const formatTime = secs => {
  if (!isFinite(secs) || isNaN(secs)) return ''
  const minutes = Math.floor(secs / 60)
  const seconds = Math.floor(secs % 60)
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}

const AudioPlayer = ({ src }) => {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const onMetadataLoaded = () => setDuration(audio.duration)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', onMetadataLoaded)
    audio.addEventListener('ended', () => setIsPlaying(false))

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', onMetadataLoaded)
    }
  }, [])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = e => {
    const newTime = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  return (
    <div className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 flex flex-col gap-3">
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />
      <div className="flex items-center justify-between">
        <button
          onClick={togglePlay}
          className="p-2 bg-purple-600/20 rounded-full text-white hover:bg-purple-600/30"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          className="w-full mx-3 h-1 rounded-lg appearance-none bg-purple-400 cursor-pointer"
        />
        <span className="text-sm text-gray-300 min-w-[45px] text-right">
          {formatTime(currentTime)}
        </span>
      </div>
    </div>
  )
}

export default AudioPlayer
