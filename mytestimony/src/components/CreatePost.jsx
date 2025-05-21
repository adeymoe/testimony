import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { UploadCloud, ArrowLeft, Mic, StopCircle, Trash2 } from 'lucide-react';

const CreatePost = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [media, setMedia] = useState([]);
  const [religion, setReligion] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [recordingDots, setRecordingDots] = useState('');

  const isFormEmpty = !title && !body && !media.length && !audioBlob;

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    setMedia(prev => [...prev, ...files]);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setAudioBlob(null);
      setAudioUrl(null);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
      animateDots();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast.error('Microphone access denied.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingDots('');
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingDots('');
  };

  const animateDots = () => {
    let dots = '';
    const interval = setInterval(() => {
      if (!isRecording) {
        clearInterval(interval);
        return;
      }
      dots = dots.length >= 3 ? '' : dots + '.';
      setRecordingDots(dots);
    }, 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const allMedia = [...media];
    if (audioBlob) {
      const voiceFile = new File([audioBlob], 'voice_note.webm', { type: 'audio/webm' });
      allMedia.push(voiceFile);
    }

    const token = localStorage.getItem("token");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("body", body);
      formData.append("religion", religion);

      allMedia.forEach(file => {
        formData.append("media", file);
      });

      const response = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/api/testimony/create",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setTitle('');
        setMedia([]);
        setBody('');
        setReligion('');
        setAudioBlob(null);
        setAudioUrl(null);
        navigate('/');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <button
        onClick={() => navigate('/')}
        className="flex items-center text-sm text-gray-300 hover:text-white transition mb-4"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Feed
      </button>
      <h1 className="text-2xl font-bold mb-6 text-center">Create Testimony</h1>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-xl mx-auto">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional field)"
          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What's your encounter..."
          rows={6}
          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Religion Dropdown */}
        <div>
          <label className="text-sm text-gray-300">Select Religion</label>
          <select
            value={religion}
            onChange={(e) => setReligion(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option className="text-black" value="">Select Religion</option>
            <option className="text-black" value="Christianity">Christianity</option>
            <option className="text-black" value="Islam">Islam</option>
            <option className="text-black" value="Judaism">Judaism</option>
            <option className="text-black" value="Hinduism">Hinduism</option>
            <option className="text-black" value="Buddhism">Buddhism</option>
            <option className="text-black" value="Other">Other</option>
          </select>
        </div>

        {/* Media Upload */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm text-gray-300">Upload Media (images/videos)</label>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleMediaChange}
            className="text-sm text-gray-200"
          />
          <div className="flex gap-3 flex-wrap mt-2">
            {media.map((file, idx) => {
              const url = URL.createObjectURL(file);
              const isImage = file.type.startsWith('image/');
              const isVideo = file.type.startsWith('video/');

              return (
                <div key={idx} className="relative group">
                  {isImage && (
                    <img
                      src={url}
                      alt={file.name}
                      className="w-24 h-24 object-cover rounded-lg border border-white/20"
                    />
                  )}
                  {isVideo && (
                    <video
                      src={url}
                      className="w-24 h-24 object-cover rounded-lg border border-white/20"
                      controls
                    />
                  )}
                  {!isImage && !isVideo && (
                    <span className="text-xs bg-white/10 px-2 py-1 rounded">
                      {file.name}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Voice Note Recording */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm text-gray-300">Record Voice Note</label>
          <div className="flex items-center gap-4">
            {!isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-full transition"
              >
                <Mic size={18} />
                <span>Start Recording</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-full transition"
              >
                <StopCircle size={18} />
                <span>Stop Recording</span>
              </button>
            )}
            {isRecording && (
              <div className="text-yellow-400 text-sm animate-pulse ml-2">
                Recording{recordingDots}
              </div>
            )}
          </div>

          {audioUrl && (
            <div className="flex flex-col mt-2 space-y-2">
              <audio controls src={audioUrl} className="w-full" />
              <button
                type="button"
                onClick={deleteRecording}
                className="flex items-center gap-2 text-sm text-red-400 hover:text-red-600 transition self-start"
              >
                <Trash2 size={16} />
                Delete Recording
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isFormEmpty || isLoading}
          className={`w-full ${isFormEmpty || isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white py-3 rounded-xl font-bold transition`}
        >
          {isLoading ? 'Creating...' : 'Create'}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
