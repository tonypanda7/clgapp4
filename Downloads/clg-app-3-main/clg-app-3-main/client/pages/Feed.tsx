import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getSupabase } from "@/utils/supabase";

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
  const [selectedCategory, setSelectedCategory] = useState("all");
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
        setHasMore(pageNum < 3);
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
      { name: "erian.cole", avatar: "" },
      { name: "liora.venn", avatar: "" },
      { name: "darin.vale", avatar: "" },
      { name: "soren.lenix", avatar: "" },
      { name: "nova.flux", avatar: "" }
    ];

    const mockContent = [
      "Sky above, earth below, peace within",
      "Each window holds a universe, each street a heartbeat",
      "Sakura season = magic in the air",
      "Beach season = bliss in the air",
      "The Italian Beach It Is",
      "Lost in the rhythm, found in the moment",
      "Hustle in silence, let success make the noise",
      "Stronger than yesterday",
      "Espresso yourself"
    ];

    return Array.from({ length: 5 }, (_, i) => {
      const user = mockUsers[i];
      const content = mockContent[i] || `Sample post from ${user.name}`;
      return {
        id: `${pageNum}-${i}`,
        userId: `user-${i}`,
        userName: user.name,
        userAvatar: user.avatar,
        content: content,
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
        // Try server-side upload first
        const MAX_BYTES = 50 * 1024 * 1024;
        if (file.size > MAX_BYTES) {
          alert('File too large. Max 50MB.');
          return;
        }
        const arr = await file.arrayBuffer();
        const bytes = new Uint8Array(arr);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        const base64 = btoa(binary);

        const token = localStorage.getItem('authToken');
        const srv = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ filename: file.name, contentType: file.type || 'application/octet-stream', data: base64 })
        });

        if (srv.ok) {
          const up = await srv.json();
          mediaUrl = up.url;
          mediaType = file.type;
        } else {
          // Fallback to client-side Supabase upload
          const sb = getSupabase();
          if (!sb) {
            console.warn('Supabase missing, skipping upload');
            mediaUrl = undefined;
            mediaType = file.type;
          } else {
            const bucket = 'posts';
            const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_');
            const path = `${userData?.id || 'anon'}/${Date.now()}_${safeName}`;
            const { error: upErr } = await sb.storage.from(bucket).upload(path, file, { contentType: file.type || 'application/octet-stream', upsert: true, cacheControl: '3600' });
            if (upErr) {
              console.error('Supabase upload error:', upErr);
              alert(`Upload failed: ${upErr.message || 'check bucket & policies'}`);
              return;
            }
            const { data } = sb.storage.from(bucket).getPublicUrl(path);
            mediaUrl = data.publicUrl;
            mediaType = file.type;
          }
        }
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
          comments: 0,
          mediaUrl,
          mediaType
        };
        setPosts(prev => [mockPost, ...prev]);
        setNewPostContent("");
        setFile(null);
      }
    } catch (error) {
      console.error("Error adding post:", error);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes: data.likesCount }
            : post
        ));
      } else {
        // Fallback for mock behavior
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes: (post.likes || 0) + 1 }
            : post
        ));
      }
    } catch (error) {
      console.error("Error liking post:", error);
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

  const categories = [
    { id: "music", name: "MUSIC", color: "#B8860B" },
    { id: "lifestyle", name: "LIFESTYLE", color: "#4682B4" },
    { id: "travel", name: "TRAVEL", color: "#8FBC8F" },
    { id: "food", name: "FOOD", color: "#DDA0DD" },
    { id: "explore", name: "EXPLORE MORE", color: "#B0CF99" }
  ];

  if (!userData) {
    return (
      <div className="w-full h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white relative">
      {/* Header with INNOVIST branding */}
      <div className="w-full h-[73px] bg-black rounded-b-[50px] flex items-center justify-start px-6">
        <h1 className="text-white text-2xl font-normal font-['Roboto_Condensed']">INNOVIST</h1>
      </div>

      {/* Community Feed Title Banner */}
      <div className="w-full relative mt-4">
        {/* Striped background */}
        <div className="w-full h-[150px] relative">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-full h-5 bg-[#ABD9D9] mb-1" />
          ))}
        </div>
        {/* Blue overlay with title */}
        <div className="absolute inset-0 bg-[#C5E4FF] rounded-[20px] mx-2 mt-2 flex items-center justify-center">
          <h1 className="text-white text-6xl md:text-7xl lg:text-8xl font-normal font-['Bowlby_One'] uppercase tracking-wide">
            COMMUNITY FEED
          </h1>
        </div>
      </div>

      <div className="flex w-full max-w-[1440px] mx-auto gap-4 p-4 lg:p-8">
        {/* Left Sidebar - Recent Posts */}
        <div className="w-full lg:w-[338px] flex-shrink-0">
          {/* Blue container for new post */}
          <div className="w-full h-[333px] bg-[#C5E4FF] rounded-[20px] p-6 mb-6">
            <h2 className="text-black text-2xl font-normal font-['Bebas_Neue'] uppercase mb-4">
              Create New Post
            </h2>
            <div className="space-y-4">
              <textarea
                placeholder="What's on your mind?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="w-full h-24 p-3 rounded-lg border-none outline-none resize-none text-sm"
              />
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-xs"
              />
              <button
                onClick={handleAddPost}
                className="w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Post
              </button>
            </div>
          </div>

          {/* Recent Posts Section */}
          <h2 className="text-black text-4xl font-normal font-['Bebas_Neue'] uppercase mb-6">
            Recent Posts
          </h2>
          
          {/* Recent posts list */}
          <div className="space-y-4">
            {posts.slice(0, 4).map((post) => (
              <div key={post.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <img
                  src={post.mediaUrl || "https://api.builder.io/api/v1/image/assets/TEMP/c0f6a16e9ecc31004767acffb8494dfe02ef77ed?width=230"}
                  alt="Post"
                  className="w-[115px] h-[115px] object-cover rounded-lg"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {getUserInitial(post.userName)}
                      </span>
                    </div>
                    <span className="text-xs text-black font-normal font-['Roboto_Condensed'] lowercase">
                      {post.userName}
                    </span>
                  </div>
                  <h3 className="text-black text-lg font-normal font-['Bebas_Neue'] uppercase leading-tight mb-2">
                    {post.content.length > 50 ? post.content.substring(0, 50) + "..." : post.content}
                  </h3>
                  <span className="text-black text-xs opacity-80">
                    {formatTimestamp(post.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Color palette */}
          <div className="grid grid-cols-3 gap-2 mt-8">
            {[
              "#8BBAD6", "#ABD9D9", "#C5E4FF",
              "#03446A", "#99BFCC", "#568693",
              "#C5E4FF", "#568693", "#03446A",
              "#568693", "#C5E4FF", "#99BFCC"
            ].map((color, i) => (
              <div
                key={i}
                className="w-[90px] h-[90px] rounded"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-4 lg:px-8">
          {/* Category Navigation */}
          <div className="w-full max-w-[722px] h-[182px] bg-[#CDE5FF] bg-opacity-87 rounded-[63px] mb-8 mx-auto">
            <div className="flex items-center justify-center h-full space-x-8 px-8">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`flex flex-col items-center cursor-pointer transition-all duration-200 hover:scale-105 ${
                    selectedCategory === category.id ? 'opacity-100' : 'opacity-80'
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div
                    className="w-[108px] h-[93px] rounded-full mb-2 flex items-center justify-center"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.id === "explore" && (
                      <span className="text-white text-4xl font-medium">+</span>
                    )}
                  </div>
                  <span className="text-black text-sm font-light font-['Roboto_Flex'] uppercase text-center">
                    {category.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-6 max-w-[722px] mx-auto">
            {posts.map((post, index) => (
              <div
                key={post.id}
                ref={index === posts.length - 1 ? lastPostElementRef : null}
                className="w-full bg-[#E9F4FF] bg-opacity-87 rounded-[10px] p-6"
              >
                {/* User info */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-black text-lg font-normal font-['Roboto_Condensed']">
                      {getUserInitial(post.userName)}
                    </span>
                  </div>
                  <div>
                    <div className="text-black text-sm font-normal font-['Roboto_Condensed'] lowercase">
                      {post.userName}
                    </div>
                  </div>
                  <div className="ml-auto text-black text-xs opacity-80">
                    {formatTimestamp(post.timestamp)}
                  </div>
                </div>

                {/* Post media */}
                {post.mediaUrl && (
                  <div className="mb-4">
                    {post.mediaType?.startsWith('video') ? (
                      <video 
                        src={post.mediaUrl} 
                        controls 
                        className="w-full max-w-[250px] h-auto rounded-lg"
                      />
                    ) : (
                      <img 
                        src={post.mediaUrl} 
                        alt="Post media" 
                        className="w-full max-w-[250px] h-auto rounded-lg object-cover"
                      />
                    )}
                  </div>
                )}

                {/* Post title */}
                <h3 className="text-black text-xl font-normal font-['Roboto_Condensed'] capitalize mb-4">
                  {post.content}
                </h3>

                {/* Lorem ipsum text */}
                <p className="text-black text-xs font-normal font-['Roboto_Flex'] text-justify leading-normal mb-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>

                {/* Interaction buttons */}
                <div className="flex items-center space-x-6">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className="flex items-center space-x-2 opacity-80 hover:opacity-100 transition-opacity"
                  >
                    <span className="text-black text-xl">❤️</span>
                    <span className="text-black text-xs uppercase">{post.likes}</span>
                  </button>
                  <button className="flex items-center space-x-2 opacity-80 hover:opacity-100 transition-opacity">
                    <svg 
                      width="19" 
                      height="14" 
                      viewBox="0 0 21 16" 
                      fill="none" 
                      className="stroke-gray-500"
                    >
                      <path 
                        d="M3.74403 14.1733L5.35266 13.1645L5.36449 13.1574C5.69985 12.947 5.86908 12.8409 6.05789 12.7653C6.22728 12.6975 6.40791 12.6481 6.59424 12.6181C6.80426 12.5843 7.02304 12.5843 7.46219 12.5843H16.6255C17.8055 12.5843 18.3962 12.5843 18.8474 12.4041C19.2446 12.2454 19.5677 11.992 19.7701 11.6806C20 11.327 20 10.8644 20 9.93941V3.64528C20 2.72026 20 2.25706 19.7701 1.90341C19.5677 1.59202 19.2439 1.33903 18.8467 1.18037C18.3951 1 17.8048 1 16.6224 1H4.37798C3.19565 1 2.60404 1 2.15245 1.18037C1.75522 1.33903 1.4325 1.59202 1.2301 1.90341C1 2.25741 1 2.72117 1 3.648V13.1397C1 14.0215 1 14.4623 1.23059 14.6888C1.43114 14.8857 1.73513 15.0003 2.05659 15C2.42621 14.9997 2.86563 14.7241 3.74403 14.1733Z" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-black text-xs uppercase">{post.comments}</span>
                  </button>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="w-full bg-[#E9F4FF] bg-opacity-87 rounded-[10px] p-6 animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                </div>
                <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Navigation */}
        <div className="w-[93px] flex-shrink-0">
          <div className="w-full h-full bg-[#9AC3C3] rounded-[50px] flex flex-col items-center py-8 space-y-12">
            {/* Menu Icon */}
            <Link to="/dashboard" className="cursor-pointer hover:scale-110 transition-all duration-200">
              <svg width="37" height="39" viewBox="0 0 37 39" fill="none">
                <path 
                  d="M7.70825 27.7647H29.2916M7.70825 19.8008H29.2916M7.70825 11.8369H20.0416" 
                  stroke="white" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            
            {/* Globe Icon */}
            <div className="cursor-pointer hover:scale-110 transition-all duration-200">
              <svg width="37" height="42" viewBox="0 0 37 42" fill="none">
                <path 
                  d="M6 20.6235H13.2222M6 20.6235C6 27.8032 11.8203 33.6235 19 33.6235M6 20.6235C6 13.4438 11.8203 7.62354 19 7.62354M13.2222 20.6235H24.7778M13.2222 20.6235C13.2222 27.8032 15.809 33.6235 19 33.6235M13.2222 20.6235C13.2222 13.4438 15.809 7.62354 19 7.62354M24.7778 20.6235H32M24.7778 20.6235C24.7778 13.4438 22.191 7.62354 19 7.62354M24.7778 20.6235C24.7778 27.8032 22.191 33.6235 19 33.6235M32 20.6235C32 13.4438 26.1797 7.62354 19 7.62354M32 20.6235C32 27.8032 26.1797 33.6235 19 33.6235" 
                  stroke="white" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            
            {/* Chat Icon */}
            <div className="cursor-pointer hover:scale-110 transition-all duration-200">
              <svg width="37" height="40" viewBox="0 0 37 40" fill="none">
                <path 
                  d="M24.6667 13.2253H30.8333C31.6848 13.2253 32.375 13.9587 32.375 14.8635V32.8847L27.2366 28.3482C26.9598 28.1038 26.6103 27.9698 26.2505 27.9698H13.875C13.0236 27.9698 12.3333 27.2363 12.3333 26.3315V21.4167M24.6667 13.2253V8.3104C24.6667 7.4056 23.9764 6.67212 23.125 6.67212H6.16667C5.31523 6.67212 4.625 7.4056 4.625 8.3104V26.332L9.76339 21.7948C10.0402 21.5504 10.3897 21.4167 10.7495 21.4167H12.3333M24.6667 13.2253V19.7784C24.6667 20.6832 23.9764 21.4167 23.125 21.4167H12.3333" 
                  stroke="white" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            
            {/* User Profile */}
            <Link 
              to="/profile" 
              className="mt-auto cursor-pointer hover:scale-110 transition-all duration-200"
            >
              <div className="w-[50px] h-[55px] bg-white rounded-full flex items-center justify-center">
                {profile?.profilePicture ? (
                  <img 
                    src={profile.profilePicture} 
                    alt="Profile" 
                    className="w-full h-full object-cover rounded-full" 
                  />
                ) : (
                  <span className="text-black text-lg font-medium opacity-70">
                    {getUserInitial(profile?.fullName || userData?.fullName || 'U')}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
