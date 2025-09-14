import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/utils/supabase";

interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
  likes?: number;
  comments?: number;
  mediaUrl?: string;
  mediaType?: string;
}

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [newPostContent, setNewPostContent] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [profile, setProfile] = useState<{ fullName: string; profilePicture?: string } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const observer = useRef<IntersectionObserver>();

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const storedUserData = localStorage.getItem("userData");

    if (!token || !storedUserData) {
      navigate("/");
      return;
    }

    try {
      const parsedUserData = JSON.parse(storedUserData);
      setUserData(parsedUserData);
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate("/");
    }
  }, [navigate]);

  // Load profile info
  useEffect(() => {
    if (!userData) return;

    try {
      const email = (userData?.universityEmail || userData?.email || "")?.toLowerCase();
      const key = email ? `profileData:${email}` : "profileData";
      const savedProfileRaw = localStorage.getItem(key) || localStorage.getItem("profileData");
      let savedProfile: any = null;
      if (savedProfileRaw) {
        try {
          savedProfile = JSON.parse(savedProfileRaw);
        } catch {}
      }

      const fullName = savedProfile?.fullName || userData?.fullName || "User";
      setProfile({ fullName, profilePicture: savedProfile?.profilePicture });
    } catch (e) {
      setProfile({ fullName: userData?.fullName || "User" });
    }
  }, [userData]);

  // Load initial posts
  useEffect(() => {
    if (userData) {
      loadPosts(1);
    }
  }, [userData]);

  const loadPosts = async (pageNum: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/posts?page=${pageNum}&limit=10`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (pageNum === 1) {
          setPosts(data.posts || []);
        } else {
          setPosts(prev => [...prev, ...(data.posts || [])]);
        }
        setHasMore(data.hasMore || false);
      } else {
        // If API doesn't exist yet, show mock data
        const mockPosts = generateMockPosts(pageNum);
        if (pageNum === 1) {
          setPosts(mockPosts);
        } else {
          setPosts(prev => [...prev, ...mockPosts]);
        }
        setHasMore(pageNum < 3); // Show 3 pages of mock data
      }
    } catch (error) {
      console.error("Error loading posts:", error);
      // Fallback to mock data
      const mockPosts = generateMockPosts(pageNum);
      if (pageNum === 1) {
        setPosts(mockPosts);
      } else {
        setPosts(prev => [...prev, ...mockPosts]);
      }
      setHasMore(pageNum < 3);
    } finally {
      setLoading(false);
    }
  };

  const generateMockPosts = (pageNum: number): Post[] => {
    const mockUsers = [
      { name: "Alice Johnson", avatar: "" },
      { name: "Bob Smith", avatar: "" },
      { name: "Carol Davis", avatar: "" },
      { name: "David Wilson", avatar: "" },
      { name: "Emma Brown", avatar: "" }
    ];

    return Array.from({ length: 5 }, (_, i) => {
      const user = mockUsers[i];
      return {
        id: `${pageNum}-${i}`,
        userId: `user-${i}`,
        userName: user.name,
        userAvatar: user.avatar,
        content: `This is a sample post content from ${user.name}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
        likes: Math.floor(Math.random() * 50),
        comments: Math.floor(Math.random() * 20)
      };
    });
  };

  // Infinite scroll
  const lastPostElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
        loadPosts(page + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, page]);

  const handleAddPost = async () => {
    if (!newPostContent.trim() && !file) return;

    try {
      let mediaUrl: string | undefined;
      let mediaType: string | undefined;

      if (file) {
        // Basic validation and safe filename
        const MAX_BYTES = 50 * 1024 * 1024; // 50MB
        if (file.size > MAX_BYTES) {
          alert('File too large. Max 50MB.');
          return;
        }
        const bucket = 'posts';
        const safeName = file.name
          .replace(/[^a-zA-Z0-9._-]/g, '_')
          .replace(/_+/g, '_');
        const path = `${userData?.id || 'anon'}/${Date.now()}_${safeName}`;
        const { error: upErr } = await supabase.storage
          .from(bucket)
          .upload(path, file, { contentType: file.type || 'application/octet-stream', upsert: true, cacheControl: '3600' });
        if (upErr) {
          console.error('Supabase upload error:', upErr);
          alert(`Upload failed: ${upErr.message || 'check bucket & policies'}`);
          return;
        }
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        mediaUrl = data.publicUrl;
        mediaType = file.type;
      }

      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newPostContent,
          mediaUrl,
          mediaType
        })
      });

      if (response.ok) {
        const data = await response.json();
        const created = data?.post ?? data;
        setPosts(prev => [created, ...prev]);
        setNewPostContent("");
        setFile(null);
      } else {
        const mockPost: Post = {
          id: `new-${Date.now()}`,
          userId: userData?.id || "current-user",
          userName: profile?.fullName || userData?.fullName || "You",
          userAvatar: profile?.profilePicture,
          content: newPostContent,
          timestamp: new Date().toISOString(),
          likes: 0,
          comments: 0
        };
        setPosts(prev => [mockPost, ...prev]);
        setNewPostContent("");
        setFile(null);
      }
    } catch (error) {
      console.error("Error adding post:", error);
    }
  };

  const getUserInitial = (name: any) => {
    if (typeof name === 'string' && name.length > 0) return name.charAt(0).toUpperCase();
    return 'U';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!userData) {
    return (
      <div className="w-full h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Black header */}
      <div className="w-full h-[73px] bg-black rounded-b-[50px]"></div>
      
      <div className="flex w-full max-w-[1440px] mx-auto relative items-stretch gap-8 px-8 py-8 h-[calc(100vh-73px)] overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-[93px] h-full bg-[#708659] rounded-[50px] flex-shrink-0 relative">
          {/* Menu Icon */}
          <svg
            className="absolute cursor-pointer hover:scale-110 transition-all duration-200"
            style={{ left: "28px", top: "44px" }}
            width="37" height="39" viewBox="0 0 37 39" fill="none"
            onClick={() => console.log('Menu clicked')}
          >
            <path d="M7.70825 27.7647H29.2916M7.70825 19.8008H29.2916M7.70825 11.8369H20.0416" 
                  stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          
          {/* Globe Icon */}
          <svg
            className="absolute cursor-pointer hover:scale-110 transition-all duration-200"
            style={{ left: "28px", top: "110px" }}
            width="37" height="41" viewBox="0 0 37 41" fill="none"
            onClick={() => console.log('Globe clicked')}
          >
            <rect width="37" height="40.411" transform="translate(0 0.311035)" fill="#708659"/>
            <path d="M6 20.311H13.2222M6 20.311C6 27.4907 11.8203 33.311 19 33.311M6 20.311C6 13.1313 11.8203 7.31104 19 7.31104M13.2222 20.311H24.7778M13.2222 20.311C13.2222 27.4907 15.809 33.311 19 33.311M13.2222 20.311C13.2222 13.1313 15.809 7.31104 19 7.31104M24.7778 20.311H32M24.7778 20.311C24.7778 13.1313 22.191 7.31104 19 7.31104M24.7778 20.311C24.7778 27.4907 22.191 33.311 19 33.311M32 20.311C32 13.1313 26.1797 7.31104 19 7.31104M32 20.311C32 27.4907 26.1797 33.311 19 33.311" 
                  stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          
          {/* Chat Icon */}
          <svg
            className="absolute cursor-pointer hover:scale-110 transition-all duration-200"
            style={{ left: "28px", top: "179px" }}
            width="37" height="40" viewBox="0 0 37 40" fill="none"
            onClick={() => console.log('Chat clicked')}
          >
            <path d="M24.6667 13.2253H30.8333C31.6848 13.2253 32.375 13.9587 32.375 14.8635V32.8847L27.2366 28.3482C26.9598 28.1038 26.6103 27.9698 26.2505 27.9698H13.875C13.0236 27.9698 12.3333 27.2363 12.3333 26.3315V21.4167M24.6667 13.2253V8.3104C24.6667 7.4056 23.9764 6.67212 23.125 6.67212H6.16667C5.31523 6.67212 4.625 7.4056 4.625 8.3104V26.332L9.76339 21.7948C10.0402 21.5504 10.3897 21.4167 10.7495 21.4167H12.3333M24.6667 13.2253V19.7784C24.6667 20.6832 23.9764 21.4167 23.125 21.4167H12.3333" 
                  stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          
          {/* User Avatar */}
          <div
            className="absolute cursor-pointer hover:scale-110 transition-all duration-200"
            style={{ left: "21px", top: "773px" }}
            onClick={() => navigate('/profile')}
          >
            <div className="w-[50px] h-[55px] bg-white rounded-full overflow-hidden flex items-center justify-center">
              {profile?.profilePicture ? (
                <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-black text-lg font-medium opacity-70">
                  {getUserInitial(profile?.fullName || userData?.fullName || 'U')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 px-8 h-full overflow-y-auto">
          {/* Add Post Section */}
          <div className="w-full max-w-[812px] h-[95px] bg-[#5382B5] rounded-[30px] mt-8 relative">
            <div className="absolute left-4 top-8 text-black font-['Just_Another_Hand'] text-xl">
              ADD POST
            </div>
            <div className="absolute left-20 top-4 right-4 h-[51px] bg-[#FFF6F6] rounded-[20px] flex items-center px-4">
              <input
                type="text"
                placeholder="What's on your mind?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm text-black placeholder-black/60"
                onKeyPress={(e) => e.key === 'Enter' && handleAddPost()}
              />
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="text-xs"
              />
              <button
                onClick={handleAddPost}
                className="ml-2 px-4 py-1 bg-[#5382B5] text-white rounded-lg text-sm hover:bg-[#4a7aa8] transition-colors"
              >
                Post
              </button>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-6 mt-6 max-w-[812px]">
            {posts.map((post, index) => (
              <div
                key={post.id}
                ref={index === posts.length - 1 ? lastPostElementRef : null}
                className="w-full bg-[#5382B5] rounded-[30px] p-6"
              >
                {/* User Avatar */}
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-10 h-9 bg-[#FEF4F4] rounded-full flex items-center justify-center flex-shrink-0">
                    {post.userAvatar ? (
                      <img src={post.userAvatar} alt="User" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span className="text-black text-sm font-medium">
                        {getUserInitial(post.userName)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">{post.userName}</div>
                    <div className="text-white/70 text-xs">{formatTimestamp(post.timestamp)}</div>
                  </div>
                </div>

                {/* Post Media */}
                {post.mediaUrl && (
                  <div className="bg-[#FFF8F8] rounded-[30px] p-2 mb-4 w-full">
                    {post.mediaType?.startsWith('video') ? (
                      <video src={post.mediaUrl} controls className="w-full rounded-[20px]" />
                    ) : (
                      <img src={post.mediaUrl} alt="media" className="w-full rounded-[20px]" />
                    )}
                  </div>
                )}
                {/* Post Content */}
                {post.content && (
                  <div className="bg-[#FFF8F8] rounded-[30px] p-6 mb-4 w-full">
                    <p className="text-black text-sm leading-relaxed break-words whitespace-pre-wrap">{post.content}</p>
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex items-center space-x-6 text-white/80 text-sm">
                  <button className="flex items-center space-x-2 hover:text-white transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.5487 7.04097 1.5487 8.5C1.5487 9.95903 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.06211 22.0329 6.39467C21.7563 5.72723 21.351 5.1208 20.84 4.61Z" 
                            fill="currentColor"/>
                    </svg>
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center space-x-2 hover:text-white transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" 
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{post.comments}</span>
                  </button>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="w-full bg-[#5382B5] rounded-[30px] p-6 animate-pulse">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-10 h-9 bg-[#FEF4F4] rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-white/20 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-white/20 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="bg-[#FFF8F8] rounded-[30px] p-6 mb-4">
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-[281px] flex-shrink-0 h-full">
          <div className="w-full h-full bg-[#708659] rounded-[50px] p-4 flex flex-col overflow-hidden">
            {/* What's Trending Section */}
            <div className="text-black font-['Just_Another_Hand'] text-xl mb-2">
              WHAT'S TRENDING ?
            </div>
            <div className="bg-white border border-[#FAE9E9] rounded-[50px] flex-[0.52] min-h-[180px]">
              <div className="p-6 space-y-4">
                <div className="text-sm text-gray-600">No trending topics yet</div>
              </div>
            </div>

            {/* Your Posts Section */}
            <div className="text-black font-['Just_Another_Hand'] text-xl mt-4 mb-2">
              YOUR POSTS
            </div>
            <div className="bg-[#FFFCFC] rounded-[50px] flex-[0.48] min-h-[150px]">
              <div className="p-6 space-y-4">
                <div className="text-sm text-gray-600">Your recent posts will appear here</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
