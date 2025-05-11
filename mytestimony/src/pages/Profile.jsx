import React, { useContext, useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import TestimonyCard from '../components/TestimonyCard'
import { ShopContext } from '../context/ShopContext'
import Spinner from '../components/Spinner'

const Profile = () => {
  const navigate = useNavigate()
  const {
    user,
    updateProfile,
    logout,
    myTestimonies,
    likedTestimonies
  } = useContext(ShopContext)

  const [tab, setTab] = useState('My Testimonies')
  const [isEditing, setIsEditing] = useState(false)

  // preview URL + file object
  const [avatarPreview, setAvatarPreview] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)

  // form fields
  const [userData, setUserData] = useState({
    name:     user?.fullName  || '',
    username: user?.username  || '',
    bio:      user?.bio       || ''
  })

  // sync whenever `user` loads/changes
  useEffect(() => {
    if (!user) return
    setUserData({
      name:     user.fullName,
      username: user.username,
      bio:      user.bio
    })
    setAvatarPreview(user.avatar)
    setAvatarFile(null)
  }, [user])

  // file input handler
  const handleAvatarChange = e => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  // save button
  const handleSave = async () => {
    const formData = new FormData()
    formData.append('name',     userData.name)
    formData.append('username', userData.username)
    formData.append('bio',      userData.bio)
    if (avatarFile) {
      formData.append('avatar', avatarFile)
    }

    await updateProfile(formData)
    setIsEditing(false)
  }

  // pick which list to show
  const renderTabContent = () => {
    const list = tab === 'My Testimonies' ? myTestimonies : likedTestimonies
    return (
      <div className="flex flex-col gap-6 mt-4">
        {list.length > 0
          ? list.map(t => <TestimonyCard key={t._id} post={t} />)
          : <p className="text-gray-400 text-center">No Testimony to display.</p>}
      </div>
    )
  }

  if (!user) return <Spinner />

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen text-white px-4 pt-6 pb-20">
      {/* Back */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center text-sm text-gray-300 hover:text-white transition mb-4"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Feed
      </button>

      {/* Header */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg p-6 rounded-2xl flex flex-col items-center text-center gap-2">
        {avatarPreview && (
          <img
            src={avatarPreview}
            alt="Avatar"
            className="w-24 h-24 rounded-full border-4 border-blue-600 shadow-lg object-cover"
          />
        )}
        <h2 className="text-2xl font-bold text-white">{userData.name}</h2>
        <p className="text-sm text-gray-300">{userData.username}</p>
        <p className="text-sm italic text-gray-400">{userData.bio}</p>
        <div className="mt-3 flex gap-3">
          <button
            onClick={() => setIsEditing(true)}
            className="px-5 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 rounded-full font-medium shadow-md transition"
          >
            Edit Profile
          </button>
          <button
            onClick={logout}
            className="px-5 py-1.5 text-sm bg-red-600 hover:bg-red-700 rounded-full font-medium shadow-md transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mt-6 space-x-3">
        {['My Testimonies', 'Liked'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              tab === t
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* List */}
      {renderTabContent()}

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-md text-black">
            <h3 className="text-xl font-semibold mb-4 text-center">Edit Profile</h3>
            <div className="space-y-3">
              <label className="block text-sm font-medium">Avatar</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
              />
              {avatarPreview && (
                <img
                  src={avatarPreview}
                  alt="Preview"
                  className="w-20 h-20 rounded-full object-cover border-2 border-blue-500 mt-2"
                />
              )}
              <input
                value={userData.name}
                onChange={e => setUserData(d => ({ ...d, name: e.target.value }))}
                placeholder="Name"
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                value={userData.username}
                onChange={e => setUserData(d => ({ ...d, username: e.target.value }))}
                placeholder="Username"
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <textarea
                value={userData.bio}
                onChange={e => setUserData(d => ({ ...d, bio: e.target.value }))}
                placeholder="Bio"
                rows={3}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
