import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthResponse } from "@shared/api";

export default function Dashboard() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [collegeData, setCollegeData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCollegeData, setIsLoadingCollegeData] = useState(false);
  const [profile, setProfile] = useState<{ fullName: string; profilePicture?: string } | null>(null);
  const navigate = useNavigate();

  // Check authentication and load user data
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      const storedUserData = localStorage.getItem("userData");

      if (!token || !storedUserData) {
        // No authentication, redirect to login
        navigate("/");
        return;
      }

      try {
        // Parse stored user data
        const parsedUserData = JSON.parse(storedUserData);
        setUserData(parsedUserData);

        // Optionally verify token with backend
        const response = await fetch("/api/auth/profile", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) {
          // Token is invalid, clear storage and redirect
          localStorage.removeItem("authToken");
          localStorage.removeItem("userData");
          navigate("/");
          return;
        }

        const data: AuthResponse = await response.json();
        if (data.user) {
          setUserData(data.user);
          // Update stored user data
          localStorage.setItem("userData", JSON.stringify(data.user));

          // Load college data if user is verified
          if (data.user.isEmailVerified) {
            await loadCollegeData(token);
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        // Clear invalid data and redirect
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // Load profile info (name + avatar) from localStorage and signup data for consistent avatar across pages
  useEffect(() => {
    try {
      const tempSignupRaw = localStorage.getItem("tempSignupData") || localStorage.getItem("signupFormData");
      let signupFullName: string | undefined;
      if (tempSignupRaw) {
        try {
          const parsed = JSON.parse(tempSignupRaw);
          signupFullName = parsed?.fullName;
        } catch {}
      }

      const email = (userData?.universityEmail || userData?.email || "")?.toLowerCase();
      const key = email ? `profileData:${email}` : "profileData";
      const savedProfileRaw = localStorage.getItem(key) || localStorage.getItem("profileData");
      let savedProfile: any = null;
      if (savedProfileRaw) {
        try {
          savedProfile = JSON.parse(savedProfileRaw);
        } catch {}
      }

      const fullName = signupFullName || savedProfile?.fullName || userData?.fullName || "User";
      setProfile({ fullName, profilePicture: savedProfile?.profilePicture });
    } catch (e) {
      // fallback minimal profile
      setProfile({ fullName: userData?.fullName || "User" });
    }
  }, [userData]);

  // Load college data
  const loadCollegeData = async (token: string) => {
    setIsLoadingCollegeData(true);
    try {
      const response = await fetch("/api/auth/college-data", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data: CollegeDataResponse = await response.json();
        if (data.success && data.collegeData) {
          setCollegeData(data.collegeData);
        }
      }
    } catch (error) {
      console.error("Error loading college data:", error);
    } finally {
      setIsLoadingCollegeData(false);
    }
  };

  const handleCardClick = (cardName: string) => {
    setSelectedCard(cardName);
    
    // Add notification for user feedback
    const newNotification = `${cardName} opened!`;
    setNotifications(prev => [...prev, newNotification]);
    
    // Simulate different actions based on card type
    switch(cardName) {
      case 'Messenger':
        console.log('Opening messenger interface...');
        break;
      case 'Clubs':
        console.log('Loading clubs directory...');
        break;
      case 'Campus Map':
        console.log('Launching interactive campus map...');
        break;
      case 'Marketplace':
        console.log('Opening marketplace...');
        break;
      case 'Gigs':
        console.log('Loading available gigs...');
        break;
      case 'Happening':
        console.log('Showing campus events...');
        break;
      case 'Image Posts':
        console.log('Opening image gallery...');
        break;
      case 'Feed':
        console.log('Opening user feed...');
        break;
      default:
        console.log(`Clicked on ${cardName}`);
    }
    
    // Auto-clear notification after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(notif => notif !== newNotification));
    }, 3000);
  };

  const handleCardHover = (cardName: string | null) => {
    setHoveredCard(cardName);
  };

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");

    // Redirect to login
    navigate("/");
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden" style={{ aspectRatio: '97/63' }}>
      {/* Container with dynamic positioning */}
      <div className="absolute inset-0 w-full h-full">
        
        {/* Left Sidebar */}
        <div 
          className="absolute bg-[#708659] rounded-[50px]"
          style={{
            left: `${(41/1512) * 100}%`,
            top: `${(160/982) * 100}%`,
            width: `${(93/1512) * 100}%`,
            height: `${(781/982) * 100}%`
          }}
        >
          {/* Menu Icon */}
          <svg
            className="absolute cursor-pointer hover:scale-110 transition-all duration-200"
            style={{
              left: `${(28/93) * 100}%`,
              top: `${(50/781) * 100}%`
            }}
            width="37" height="35" viewBox="0 0 37 35" fill="none"
            onClick={() => handleCardClick('Menu')}
            onMouseEnter={() => handleCardHover('Menu')}
            onMouseLeave={() => handleCardHover(null)}
          >
            <path d="M7.70825 24.7917H29.2916M7.70825 17.5H29.2916M7.70825 10.2083H20.0416" 
                  stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          
          {/* Globe Icon */}
          <svg
            className="absolute cursor-pointer hover:scale-110 transition-all duration-200"
            style={{
              left: `${(28/93) * 100}%`,
              top: `${(120/781) * 100}%`
            }}
            width="37" height="37" viewBox="0 0 37 37" fill="none"
            onClick={() => handleCardClick('Globe')}
            onMouseEnter={() => handleCardHover('Globe')}
            onMouseLeave={() => handleCardHover(null)}
          >
            <rect width="37" height="37" fill="#708659"/>
            <path d="M6 19H13.2222M6 19C6 26.1797 11.8203 32 19 32M6 19C6 11.8203 11.8203 6 19 6M13.2222 19H24.7778M13.2222 19C13.2222 26.1797 15.809 32 19 32M13.2222 19C13.2222 11.8203 15.809 6 19 6M24.7778 19H32M24.7778 19C24.7778 11.8203 22.191 6 19 6M24.7778 19C24.7778 26.1797 22.191 32 19 32M32 19C32 11.8203 26.1797 6 19 6M32 19C32 26.1797 26.1797 32 19 32" 
                  stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          
          {/* Chat Icon */}
          <svg
            className="absolute cursor-pointer hover:scale-110 transition-all duration-200"
            style={{
              left: `${(28/93) * 100}%`,
              top: `${(190/781) * 100}%`
            }}
            width="37" height="36" viewBox="0 0 37 36" fill="none"
            onClick={() => handleCardClick('Sidebar Chat')}
            onMouseEnter={() => handleCardHover('Sidebar Chat')}
            onMouseLeave={() => handleCardHover(null)}
          >
            <path d="M24.6667 12H30.8333C31.6848 12 32.375 12.6716 32.375 13.5V30L27.2366 25.8464C26.9598 25.6227 26.6103 25.5 26.2505 25.5H13.875C13.0236 25.5 12.3333 24.8284 12.3333 24V19.5M24.6667 12V7.5C24.6667 6.67157 23.9764 6 23.125 6H6.16667C5.31523 6 4.625 6.67157 4.625 7.5V24.0004L9.76339 19.8462C10.0402 19.6225 10.3897 19.5 10.7495 19.5H12.3333M24.6667 12V18C24.6667 18.8284 23.9764 19.5 23.125 19.5H12.3333" 
                  stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          
          {/* User Avatar */}
          <div
            className="absolute cursor-pointer hover:scale-110 transition-all duration-200"
            style={{
              left: `${(22/93) * 100}%`,
              top: `${(700/781) * 100}%`
            }}
            onClick={() => navigate('/profile')}
            onMouseEnter={() => handleCardHover('User Profile')}
            onMouseLeave={() => handleCardHover(null)}
          >
            <div className="w-[50px] h-[50px] bg-white rounded-full overflow-hidden flex items-center justify-center">
              {profile?.profilePicture ? (
                <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-black text-sm font-medium opacity-70">
                  {(profile?.fullName || userData?.fullName || 'U').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar Container */}
        <div
          className="absolute bg-[#FCF3E3] rounded-[50px]"
          style={{
            left: `${(41/1512) * 100}%`,
            top: `${(49/982) * 100}%`,
            width: `${(511/1512) * 100}%`,
            height: `${(88/982) * 100}%`
          }}
        >
        </div>

        {/* Feed Card */}
        <div
          className="absolute bg-[#FCF3E3] rounded-[50px] cursor-pointer hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 overflow-visible"
          style={{
            left: `${(167/1512) * 100}%`,
            top: `${(49/982) * 100}%`,
            width: `${(519/1512) * 100}%`,
            height: `${(361/982) * 100}%`
          }}
          onClick={() => handleCardClick('Feed')}
          onMouseEnter={() => handleCardHover('Feed')}
          onMouseLeave={() => handleCardHover(null)}
        >
          {/* Extended Search Input - positioned absolutely to extend into feed */}
          <div
            className="absolute bg-white rounded-[50px] flex items-center px-4 z-10"
            style={{
              left: `${((64-167)/519) * 100}%`,
              top: `${((69-49)/361) * 100}%`,
              width: `${(596/519) * 100}%`,
              height: `${(48/361) * 100}%`
            }}
          >
            <input
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-xs text-black placeholder-black/60"
            />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="ml-2">
              <path d="M15 15L21 21M10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10C17 13.866 13.866 17 10 17Z"
                    stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {/* Profile Avatar */}
          <div
            className="absolute"
            style={{
              left: `${(18/519) * 100}%`,
              top: `${(88/361) * 100}%`
            }}
          >
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <circle cx="15" cy="15" r="15" fill="#D9D9D9"/>
            </svg>
          </div>

          {/* Profile Name */}
          <div
            className="absolute font-sans text-xs text-black"
            style={{
              left: `${(62/519) * 100}%`,
              top: `${(96/361) * 100}%`
            }}
          >
            {userData?.fullName || "User Name"}
          </div>

          {/* Feed Content Area */}
          <div
            className="absolute bg-white rounded-[40px]"
            style={{
              left: `${(30/519) * 100}%`,
              top: `${(131/361) * 100}%`,
              width: `${(463/519) * 100}%`,
              height: `${(209/361) * 100}%`
            }}
          >
          </div>
          
        </div>

        {/* TO BE ADDED (top right small) */}
        <div 
          className="absolute bg-[#FCF3E3] rounded-[50px] cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center"
          style={{
            left: `${(716/1512) * 100}%`,
            top: `${(49/982) * 100}%`,
            width: `${(189/1512) * 100}%`,
            height: `${(127/982) * 100}%`
          }}
          onClick={() => handleCardClick('To Be Added 1')}
          onMouseEnter={() => handleCardHover('To Be Added 1')}
          onMouseLeave={() => handleCardHover(null)}
        >
          <span className="font-sans text-lg text-black text-center">
            TO BE ADDED
          </span>
        </div>

        {/* HAPPENING */}
        <div 
          className="absolute bg-[#FCF3E3] rounded-[50px] cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center"
          style={{
            left: `${(716/1512) * 100}%`,
            top: `${(298/982) * 100}%`,
            width: `${(189/1512) * 100}%`,
            height: `${(112/982) * 100}%`
          }}
          onClick={() => handleCardClick('Happening')}
          onMouseEnter={() => handleCardHover('Happening')}
          onMouseLeave={() => handleCardHover(null)}
        >
          <span className="font-sans text-lg text-black">
            HAPPENING
          </span>
        </div>

        {/* Images Post Area (top right large) */}
        <div 
          className="absolute bg-[#FCF3E3] rounded-[50px] border border-black cursor-pointer hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 flex items-center justify-center"
          style={{
            left: `${(935/1512) * 100}%`,
            top: `${(49/982) * 100}%`,
            width: `${(519/1512) * 100}%`,
            height: `${(361/982) * 100}%`
          }}
          onClick={() => handleCardClick('Image Posts')}
          onMouseEnter={() => handleCardHover('Image Posts')}
          onMouseLeave={() => handleCardHover(null)}
        >
          <span className="font-sans text-sm text-black text-center">
            images from your post appear here
          </span>
        </div>

        {/* Center Gradient Banner */}
        <div 
          className="absolute rounded-[50px] flex items-center justify-center"
          style={{
            left: `${(167/1512) * 100}%`,
            top: `${(444/982) * 100}%`,
            width: `${(1287/1512) * 100}%`,
            height: `${(135/982) * 100}%`,
            background: 'rgba(150, 231, 215, 0.87)'
          }}
        >
          <span className="font-sans text-black" style={{ fontSize: 'clamp(16px, 3vw, 40px)' }}>
            abcdefg
          </span>
        </div>

        {/* GIGS Card */}
        <div 
          className="absolute bg-[#FCF3E3] rounded-[50px] cursor-pointer hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 overflow-hidden"
          style={{
            left: `${(167/1512) * 100}%`,
            top: `${(613/982) * 100}%`,
            width: `${(433/1512) * 100}%`,
            height: `${(317/982) * 100}%`
          }}
          onClick={() => handleCardClick('Gigs')}
          onMouseEnter={() => handleCardHover('Gigs')}
          onMouseLeave={() => handleCardHover(null)}
        >
          <span 
            className="absolute font-sans text-sm text-black"
            style={{
              left: `${(49/433) * 100}%`,
              top: `${(34/317) * 100}%`
            }}
          >
            GIGS !!!
          </span>
          {/* Inner white content area */}
          <div 
            className="absolute bg-white rounded-[40px]"
            style={{
              left: `${(23/433) * 100}%`,
              top: `${(69/317) * 100}%`,
              width: `${(387/433) * 100}%`,
              height: `${(231/317) * 100}%`
            }}
          >
          </div>
        </div>

        {/* MESSENGER */}
        <div 
          className="absolute bg-[#FCF3E3] rounded-[50px] border border-black cursor-pointer hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 flex items-center justify-center"
          style={{
            left: `${(630/1512) * 100}%`,
            top: `${(609/982) * 100}%`,
            width: `${(315/1512) * 100}%`,
            height: `${(317/982) * 100}%`
          }}
          onClick={() => handleCardClick('Messenger')}
          onMouseEnter={() => handleCardHover('Messenger')}
          onMouseLeave={() => handleCardHover(null)}
        >
          <span className="font-sans text-lg text-black">
            MESSENGER
          </span>
        </div>

        {/* CLUBS */}
        <div 
          className="absolute bg-[#FCF3E3] rounded-[50px] cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center"
          style={{
            left: `${(973/1512) * 100}%`,
            top: `${(613/982) * 100}%`,
            width: `${(147/1512) * 100}%`,
            height: `${(143/982) * 100}%`
          }}
          onClick={() => handleCardClick('Clubs')}
          onMouseEnter={() => handleCardHover('Clubs')}
          onMouseLeave={() => handleCardHover(null)}
        >
          <span className="font-sans text-lg text-black">
            CLUBS
          </span>
        </div>

        {/* CAMPUS MAP */}
        <div 
          className="absolute bg-[#FCF3E3] rounded-[50px] cursor-pointer hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 flex items-center justify-center"
          style={{
            left: `${(1145/1512) * 100}%`,
            top: `${(613/982) * 100}%`,
            width: `${(309/1512) * 100}%`,
            height: `${(143/982) * 100}%`
          }}
          onClick={() => handleCardClick('Campus Map')}
          onMouseEnter={() => handleCardHover('Campus Map')}
          onMouseLeave={() => handleCardHover(null)}
        >
          <span className="font-sans text-lg text-black text-center">
            CAMPUS MAP
          </span>
        </div>

        {/* MARKETPLACE */}
        <div 
          className="absolute bg-[#FCF3E3] rounded-[50px] cursor-pointer hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 flex items-center justify-center"
          style={{
            left: `${(970/1512) * 100}%`,
            top: `${(772/982) * 100}%`,
            width: `${(319/1512) * 100}%`,
            height: `${(158/982) * 100}%`
          }}
          onClick={() => handleCardClick('Marketplace')}
          onMouseEnter={() => handleCardHover('Marketplace')}
          onMouseLeave={() => handleCardHover(null)}
        >
          <span className="font-sans text-lg text-black">
            MARKETPLACE
          </span>
        </div>

        {/* COLLEGE DATA PANEL */}
        <div
          className="absolute bg-[#E8F4FD] rounded-[50px] cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 p-4 overflow-hidden"
          style={{
            left: `${(1307/1512) * 100}%`,
            top: `${(772/982) * 100}%`,
            width: `${(147/1512) * 100}%`,
            height: `${(158/982) * 100}%`
          }}
          onClick={() => handleCardClick('College Data')}
          onMouseEnter={() => handleCardHover('College Data')}
          onMouseLeave={() => handleCardHover(null)}
        >
          {collegeData ? (
            <div className="h-full flex flex-col justify-center text-center space-y-1">
              <div className="font-sans text-[9px] font-bold text-black">
                COLLEGE DATA
              </div>
              <div className="font-sans text-[7px] text-black">
                {collegeData.department}
              </div>
              <div className="font-sans text-[6px] text-black opacity-70">
                {collegeData.semester} {collegeData.academicYear}
              </div>
              <div className="font-sans text-[6px] text-black opacity-70">
                {collegeData.courses?.length || 0} Courses
              </div>
              {collegeData.gpa && (
                <div className="font-sans text-[7px] text-green-600 font-bold">
                  GPA: {collegeData.gpa}
                </div>
              )}
            </div>
          ) : userData?.isEmailVerified ? (
            <div className="h-full flex flex-col justify-center text-center">
              {isLoadingCollegeData ? (
                <div className="font-sans text-[9px] text-black">
                  Loading...
                </div>
              ) : (
                <div className="font-sans text-[9px] text-black">
                  No college data available
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center text-center">
              <div className="font-sans text-[8px] text-yellow-600">
                Verify email to access college data
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>


        {/* Search Results Overlay */}
        {searchValue && (
          <div className="fixed top-32 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl p-4 z-40 min-w-[300px]">
            <h3 className="font-sans text-sm font-semibold mb-2">Search Results for "{searchValue}"</h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="cursor-pointer hover:bg-gray-100 p-2 rounded">No results found</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
