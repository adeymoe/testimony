import React, { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Carousel } from 'react-responsive-carousel'
import AudioPlayer from './AudioPlayer'
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import { Heart, MessageCircle } from 'lucide-react'
import { ShopContext } from '../context/ShopContext'

const availableReactions = ['🎉', '😭', '🙏', '🔥', '😊']

const TestimonyCard = ({ post }) => {
  const { toggleLike, toggleReact, token, user } = useContext(ShopContext)
  const navigate = useNavigate()

  const testimony = post
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(
    typeof testimony.totalLikes === 'number'
      ? testimony.totalLikes
      : testimony.likes?.length || 0
  )
  const [reactions, setReactions] = useState(testimony.reactions || {})
  const [userReaction, setUserReaction] = useState(testimony.userReaction || null)
  const [isLiking, setIsLiking] = useState(false)
  const [isReacting, setIsReacting] = useState(false)

  useEffect(() => {
    if (user?._id && Array.isArray(testimony.likes)) {
      setLiked(testimony.likes.includes(user._id))
    }
  }, [user, testimony.likes])

  const handleToggleLike = async () => {
    if (!token || !testimony._id || isLiking) return
    setIsLiking(true)
    try {
      const result = await toggleLike(testimony._id)
      if (result.success) {
        setLiked(result.liked)
        setLikeCount(result.totalLikes)
      }
    } catch (err) {
      console.error('Error toggling like:', err)
    }
    setIsLiking(false)
  }

  const handleReaction = async (emoji) => {
    if (!token || isReacting) return
    setIsReacting(true)
    try {
      const newReaction = userReaction === emoji ? null : emoji
      const res = await toggleReact(testimony._id, newReaction)
      if (res.success) {
        setReactions(res.reactions)
        setUserReaction(res.userReaction)
      }
    } catch (err) {
      console.error('Reaction toggle failed:', err)
    }
    setIsReacting(false)
  }

  const goToProfile = () => navigate(`/profile/${testimony.user._id}`)

  const extractUrl = (item) => (typeof item === 'string' ? item : item?.url || '')
  const mediaFiles = (testimony.media || []).map(extractUrl).filter(Boolean)
  const imageVideoFiles = mediaFiles.filter(url => !url.match(/\.(mp3|wav|ogg|webm)$/))
  const audioFiles = mediaFiles.filter(url => url.match(/\.(mp3|wav|ogg|webm)$/))

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    if (isNaN(date)) return 'Invalid time'
    const now = new Date()
    const diff = (now - date) / 1000
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <div className="relative bg-white/5 backdrop-blur-md border border-white/10 shadow-lg p-4 rounded-xl text-white">
      {/* Author */}
      <div className="flex items-center gap-3 mb-2 cursor-pointer" onClick={goToProfile}>
        <img src={testimony.user.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
        <div>
          <p className="font-semibold">{testimony.user.username}</p>
          <p className="text-xs text-gray-400">{formatTimestamp(testimony.createdAt)}</p>
        </div>
      </div>

      {/* Religion */}
      {testimony.religion && (
        <div className="absolute top-3 right-3 text-[11px] sm:text-xs text-white bg-purple-600/20 px-2 py-1 rounded-full flex items-center gap-1">
          <span className="text-purple-400 text-[10px]">🔘</span>
          <span className="capitalize">{testimony.religion}</span>
        </div>
      )}

      {/* Text Body */}
      <p className="text-sm mb-3">{testimony.body}</p>

      {/* Carousel */}
      {imageVideoFiles.length > 0 && (
        <Carousel showThumbs={false} showStatus={false} infiniteLoop>
          {imageVideoFiles.map((url, i) =>
            url.match(/\.(mp4|mov)$/) ? (
              <video key={i} src={url} controls className="w-full max-w-[600px] max-h-[335px] object-cover rounded-lg mx-auto" />
            ) : (
              <img key={i} src={url} alt={`media-${i}`} className="w-full max-w-[600px] max-h-[335px] object-cover rounded-lg mx-auto" />
            )
          )}
        </Carousel>
      )}

      {/* Audio Player */}
      {audioFiles.length > 0 && (
        <div className="mt-3 space-y-4">
          {audioFiles.map((url, index) => (
            <AudioPlayer key={index} src={url} />
          ))}
        </div>
      )}

      {/* Like & Comment */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-3">
          <button onClick={handleToggleLike} className="flex items-center gap-1" disabled={isLiking}>
            <Heart size={20} className={liked ? 'text-red-500 fill-red-500' : 'text-white'} />
            <span className="text-sm">{likeCount}</span>
          </button>
          <div className="flex items-center gap-1">
            <MessageCircle size={18} />
            <span className="text-sm">{testimony.comments?.length || 0}</span>
          </div>
        </div>
      </div>

      {/* Reactions */}
      <div className="flex flex-wrap gap-2 mt-3">
        {availableReactions.map((emoji) => {
          const count = reactions[emoji] || 0
          const hasReacted = userReaction === emoji
          return (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              disabled={isReacting}
              className={`px-2 py-1 rounded-full text-sm border transition ${
                hasReacted ? 'bg-blue-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {emoji} {count}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default TestimonyCard
