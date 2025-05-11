import { createContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

export const ShopContext = createContext()

export const ShopContextProvider = ({ children }) => {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [myTestimonies, setMyTestimonies] = useState([])
  const [likedTestimonies, setLikedTestimonies] = useState([])

  useEffect(() => {
    if (token) {
      fetchUser()
      fetchUserTestimonies()
      fetchLikedTestimonies()
    }
  }, [token])

  const fetchUser = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setUser(res.data.user)
    } catch (err) {
      console.error(err)
      logout()
    }
  }

  const toggleLike = async (testimonyId) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/testimony/${testimonyId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return res.data
    } catch (error) {
      console.error('Failed to like testimony:', error)
    }
  }

  const toggleReact = async (testimonyId, emoji) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/testimony/${testimonyId}/react`,
        { emoji },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return res.data
    } catch (error) {
      console.error('Failed to toggle reaction:', error)
    }
  }

  const fetchUserTestimonies = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/testimony/my-testimonies`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      // backend returns { success, data: [...] }
      setMyTestimonies(res.data.data || [])
    } catch (err) {
      console.error('Failed to fetch my testimonies', err)
    }
  }

  const fetchLikedTestimonies = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/testimony/liked-testimonies`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setLikedTestimonies(res.data.data || [])
    } catch (err) {
      console.error('Failed to fetch liked testimonies', err)
    }
  }

  const updateProfile = async (updatedData) => {
    try {
      const isForm = updatedData instanceof FormData
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/update`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Let axios set multipart boundary if FormData
            ...(isForm ? {} : { 'Content-Type': 'application/json' })
          }
        }
      )
      if (res.data.success) {
        setUser(res.data.user)
        toast.success('Profile updated successfully')
      } else {
        toast.error(res.data.message)
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to update profile')
    }
  }

  const login = async (email, password) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/login`,
        { email, password }
      )
      if (res.data.success) {
        localStorage.setItem('token', res.data.token)
        setToken(res.data.token)
        navigate('/')
      } else {
        toast.error(res.data.message)
      }
    } catch (err) {
      console.error(err)
      toast.error('Login failed. Try again.')
    }
  }

  const register = async (fullName, username, email, password) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/register`,
        { fullName, username, email, password }
      )
      if (res.data.success) {
        localStorage.setItem('token', res.data.token)
        setToken(res.data.token)
        navigate('/')
      } else {
        toast.error(res.data.message)
      }
    } catch (err) {
      console.error(err)
      toast.error('Registration failed. Try again.')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken('')
    setUser(null)
    navigate('/signin')
  }

  return (
    <ShopContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        updateProfile,
        myTestimonies,
        likedTestimonies,
        fetchUserTestimonies,
        fetchLikedTestimonies,
        toggleLike,
        toggleReact
      }}
    >
      {children}
    </ShopContext.Provider>
  )
}
