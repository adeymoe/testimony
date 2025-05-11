import React, { useRef, useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import TestimonyCard from '../components/TestimonyCard';
import Navbar from '../components/Navbar';
import ProfileIcon from '../components/ProfileIcon';
import FloatingCreateButton from '../components/FloatingCreateButton';
import axios from 'axios';

const religions = ['All', 'Trending', 'Christianity', 'Islam', 'Buddhism', 'Hinduism'];

const Feed = () => {
  const feedTopRef = useRef(null);
  const [filter, setFilter] = useState('All');
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    resetAndFetch();
  }, [filter]);

  const resetAndFetch = () => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    fetchPosts(1, true);
  };

  const fetchPosts = async (pageNum, replace = false) => {
    try {
      const params = {
        page: pageNum,
        limit: 10,
        religion: filter,
        sort: filter === 'Trending' ? 'trending' : 'latest',
      };

      const res = await axios.get(import.meta.env.VITE_BACKEND_URL + "/api/testimony/all", { params });
      const postsArray = res.data.data;

      if (!Array.isArray(postsArray)) {
        console.error("Unexpected response format:", res.data);
        return;
      }

      if (postsArray.length === 0) {
        setHasMore(false);
        return;
      }

      if (replace) {
        setPosts(postsArray);
      } else {
        setPosts(prev => [...prev, ...postsArray]);
      }

      setPage(pageNum + 1);
    } catch (err) {
      console.error("Error fetching testimonies", err);
    }
  };

  const scrollToTop = () => {
    if (feedTopRef.current) {
      feedTopRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex justify-center bg-gray-900 min-h-screen text-white">
      <div className="w-full max-w-4xl md:w-3/4 px-4 pt-4 pb-20">
        <div className="flex justify-between items-center mb-4 sticky top-0 z-10 bg-gray-900 py-2 px-4">
          <ProfileIcon />
          <h1 className="text-2xl font-bold text-white">Testimony Hub</h1>
        </div>

        <div ref={feedTopRef} />

        {/* Filter Buttons */}
        <div className="mb-4 flex gap-2 flex-wrap">
          {religions.map(r => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === r ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'
              } hover:bg-blue-500 transition`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Posts Feed */}
        <InfiniteScroll
          dataLength={posts.length}
          next={() => fetchPosts(page)}
          hasMore={hasMore}
          loader={<h4>Loading...</h4>}
        >
          <div className="flex flex-col gap-6">
            {posts.map(post => (
              <TestimonyCard key={post._id} post={post} />
            ))}
          </div>
        </InfiniteScroll>

        <FloatingCreateButton />
        <Navbar onHomeClick={scrollToTop} />
      </div>
    </div>
  );
};

export default Feed;
