import React from 'react'
import { UserCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const ProfileIcon = () => {
  const navigate = useNavigate()
  return (
    <button onClick={() => navigate('/profile')} className="text-gray-600 hover:text-blue-500 transition">
      <UserCircle2 size={32} />
    </button>
  )
}

export default ProfileIcon
