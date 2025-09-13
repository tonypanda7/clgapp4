import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ImageCropModal from "../components/ImageCropModal";

interface ProfileData {
  fullName: string;
  username: string;
  university: string;
  degree: string;
  year: string;
  quote: string;
  aboutMe: string;
  skills: string[];
  projects: { title: string; description: string }[];
  certifications: string[];
  languages: string[];
  events: string[];
  hobbies: string[];
  profilePicture?: string; // Base64 encoded image or URL
}

const defaultProfileData: ProfileData = {
  fullName: "Aanya Sharma",
  username: "@aanya_s",
  university: "Shiv Nadar University Chennai",
  degree: "B.Tech in Computer Science",
  year: "3rd Year",
  quote:
    "Designing for impact. Coding for clarity. Bridging creativity and logic.",
  aboutMe: "",
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  events: [],
  hobbies: [],
  profilePicture: undefined,
};

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] =
    useState<ProfileData>(defaultProfileData);
  const [tempData, setTempData] = useState<ProfileData>(defaultProfileData);
  const [isEditingProfilePic, setIsEditingProfilePic] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string>("");
  const navigate = useNavigate();

  const deriveUniversityName = (email: string) => {
    const domain = (email?.split("@")[1] || "").toLowerCase();
    const first = domain.split(".")[0] || "";
    if (!first) return "";
    return first.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getProfileStorageKey = (email?: string | null) =>
    email ? `profileData:${email.toLowerCase()}` : "profileData";

  const getCurrentUserEmail = (): string | null => {
    try {
      const raw = localStorage.getItem("userData");
      if (!raw) return null;
      const u = JSON.parse(raw);
      return u?.universityEmail || u?.email || null;
    } catch {
      return null;
    }
  };

  const cleanProfile = (data: ProfileData): ProfileData => {
    const trim = (s?: string) => (s ?? "").trim();
    const cleanedProjects = (data.projects || []).map(p => ({
      title: trim(p.title),
      description: trim(p.description),
    })).filter(p => p.title || p.description);
    return {
      ...data,
      skills: (data.skills || []).map(s => trim(s)).filter(Boolean),
      projects: cleanedProjects,
      certifications: (data.certifications || []).map(s => trim(s)).filter(Boolean),
      languages: (data.languages || []).map(s => trim(s)).filter(Boolean),
      events: (data.events || []).map(s => trim(s)).filter(Boolean),
      hobbies: (data.hobbies || []).map(s => trim(s)).filter(Boolean),
    };
  };

  // Check authentication and load user data
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      const storedUserData = localStorage.getItem("userData");

      console.log(
        "Profile: Checking auth - token:",
        !!token,
        "userData:",
        !!storedUserData,
      );

      // First, always check for temporary signup data to get the most recent fullName
      const tempSignupData =
        localStorage.getItem("tempSignupData") ||
        localStorage.getItem("signupFormData");

      let signupFullName = null;
      let signupUniversityName = null;
      let signupEmail = null as string | null;
      let isNewAccount = false;
      if (tempSignupData) {
        try {
          const signupData = JSON.parse(tempSignupData);
          signupFullName = signupData.fullName;
          signupEmail = signupData.universityEmail || signupData.email || null;
          signupUniversityName = signupData.universityName || (signupData.universityEmail ? deriveUniversityName(signupData.universityEmail) : null);
          isNewAccount = !!signupData.newAccount;
          console.log("Profile: Found signup fullName:", signupFullName, "university:", signupUniversityName, "newAccount:", isNewAccount);
        } catch (error) {
          console.error("Error parsing temp signup data:", error);
        }
      }

      // If no auth data, use signup data or redirect
      if (!token || !storedUserData) {
        console.log(
          "Profile: No auth data found, checking for signup data...",
        );

        if (signupFullName) {
          const initialProfileData = {
            ...defaultProfileData,
            fullName: signupFullName,
            university: signupUniversityName || defaultProfileData.university,
          };
          setProfileData(initialProfileData);
          setTempData(initialProfileData);
          try {
            const key = getProfileStorageKey(signupEmail);
            localStorage.setItem(key, JSON.stringify(initialProfileData));
          } catch {}
          return;
        }

        // If no signup data either, redirect to signin
        navigate("/");
        return;
      }

      try {
        const parsedUserData = JSON.parse(storedUserData);
        console.log("Profile: Parsed user data:", parsedUserData);

        // Determine the fullName to use - prioritize signup data, then stored user data, then default
        const userFullName = signupFullName || parsedUserData.fullName || defaultProfileData.fullName;
        const userUniversity = signupUniversityName || parsedUserData.university || defaultProfileData.university;
        const userEmail = parsedUserData.universityEmail || parsedUserData.email || signupEmail || null;
        console.log("Profile: Using fullName:", userFullName, "university:", userUniversity, "email:", userEmail);

        // Load saved profile data from localStorage
        const profileKey = getProfileStorageKey(userEmail);
        if (isNewAccount && userEmail) {
          try { localStorage.removeItem(profileKey); } catch {}
        }
        const savedProfile = localStorage.getItem(profileKey) || localStorage.getItem("profileData");
        let initialProfileData = defaultProfileData;

        if (savedProfile) {
          try {
            const parsed = JSON.parse(savedProfile);
            // Even if we have saved profile data, update the fullName if we have more recent signup data
            initialProfileData = {
              ...parsed,
              fullName: userFullName, // Always use the most recent fullName
              university: userUniversity,
            };
            console.log("Profile: Updated saved profile with correct fullName");
          } catch (error) {
            console.error("Error loading profile data:", error);
            // Fallback to initial data with correct name
            initialProfileData = {
              ...defaultProfileData,
              fullName: userFullName,
              university: userUniversity,
            };
          }
        } else {
          // If no saved profile, initialize with correct fullName
          console.log("Profile: Initializing new profile with correct fullName");
          initialProfileData = {
            ...defaultProfileData,
            fullName: userFullName,
            university: userUniversity,
          };
        }

        console.log("Profile: Final profile data:", {
          fullName: initialProfileData.fullName,
          username: initialProfileData.username,
        });

        const sanitized = cleanProfile(initialProfileData);
        setProfileData(sanitized);
        setTempData(sanitized);

        // Save the corrected profile data for future loads
        try {
          const key = getProfileStorageKey(userEmail);
          localStorage.setItem(key, JSON.stringify(sanitized));
          localStorage.removeItem("profileData");
          // Clear the newAccount flag after first load
          const temp = localStorage.getItem("tempSignupData");
          if (temp) {
            try {
              const parsed = JSON.parse(temp);
              if (parsed?.newAccount) {
                delete parsed.newAccount;
                localStorage.setItem("tempSignupData", JSON.stringify(parsed));
              }
            } catch {}
          }
        } catch {}
      } catch (error) {
        console.error("Auth check error:", error);
        navigate("/");
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSave = () => {
    const cleaned = cleanProfile(tempData);
    setProfileData(cleaned);
    setTempData(cleaned);
    try {
      const key = getProfileStorageKey(getCurrentUserEmail());
      localStorage.setItem(key, JSON.stringify(cleaned));
    } catch {}
    setIsEditing(false);
    setIsEditingProfilePic(false);
    setShowCropModal(false);
    setSelectedImageSrc("");
  };

  const handleCancel = () => {
    setTempData(profileData);
    setIsEditing(false);
    setIsEditingProfilePic(false);
    setShowCropModal(false);
    setSelectedImageSrc("");
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    navigate("/");
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert("Please select an image file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setSelectedImageSrc(base64String);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }

    // Reset the input value so the same file can be selected again
    event.target.value = '';
  };

  const handleCropSave = (croppedImage: string) => {
    const updatedData = {
      ...profileData,
      profilePicture: croppedImage,
    };

    // Update both profileData and tempData immediately
    setProfileData(updatedData);
    setTempData(updatedData);

    // Save to localStorage immediately
    try {
      const key = getProfileStorageKey(getCurrentUserEmail());
      localStorage.setItem(key, JSON.stringify(updatedData));
    } catch {}

    setShowCropModal(false);
    setSelectedImageSrc("");
    setIsEditingProfilePic(false);
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setSelectedImageSrc("");
    setIsEditingProfilePic(false);
  };

  const handleRemoveProfilePicture = () => {
    const updatedData = {
      ...profileData,
      profilePicture: undefined,
    };

    // Update both profileData and tempData immediately
    setProfileData(updatedData);
    setTempData(updatedData);

    // Save to localStorage immediately
    try {
      const key = getProfileStorageKey(getCurrentUserEmail());
      localStorage.setItem(key, JSON.stringify(updatedData));
    } catch {}

    setIsEditingProfilePic(false);
  };


  const data = isEditing ? tempData : profileData;

  const hasSkills = (data.skills || []).some(s => s.trim() !== "");
  const hasProjects = (data.projects || []).some(p => (p.title?.trim() || "") !== "" || (p.description?.trim() || "") !== "");
  const hasCertifications = (data.certifications || []).some(s => s.trim() !== "");
  const hasLanguages = (data.languages || []).some(s => s.trim() !== "");
  const hasEvents = (data.events || []).some(s => s.trim() !== "");
  const hasHobbies = (data.hobbies || []).some(s => s.trim() !== "");

  // Dynamic font sizing based on content length
  const getDynamicNameSize = (text: string) => {
    const length = text.length;
    if (length <= 15)
      return "text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl";
    if (length <= 25)
      return "text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl";
    if (length <= 35)
      return "text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl";
    return "text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl";
  };

  const getDynamicUsernameSize = (text: string) => {
    const length = text.length;
    if (length <= 15) return "text-sm sm:text-base";
    if (length <= 25) return "text-xs sm:text-sm";
    return "text-xs";
  };

  const getDynamicUniversitySize = (totalText: string) => {
    const length = totalText.length;
    if (length <= 50) return "text-xs sm:text-sm";
    if (length <= 80) return "text-xs";
    return "text-[10px] sm:text-xs";
  };

  const getDynamicQuoteSize = (text: string) => {
    const length = text.length;
    if (length <= 50) return "text-xs sm:text-sm";
    if (length <= 100) return "text-[10px] sm:text-xs";
    return "text-[9px] sm:text-[10px]";
  };

  return (
    <div
      className="min-h-screen bg-white overflow-x-hidden break-words overflow-wrap-break-word"
      style={{
        maxWidth: "100vw",
        wordWrap: "break-word",
        overflowWrap: "break-word",
      }}
    >
      {/* Top header - fixed black header */}
      <div className="fixed top-0 left-0 w-full h-[73px] bg-black rounded-b-[50px] z-30" />

      {/* Main content container */}
      <div className="relative z-10 w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 overflow-x-hidden">
        {/* Sidebar */}
        <div className="fixed left-4 sm:left-8 top-28 bottom-4 z-20">
          <div className="w-[93px] h-full max-h-[calc(100vh-8rem)] bg-[#708659] rounded-[50px] flex flex-col items-center py-8">
            {/* Menu icon */}
            <svg
              className="w-9 h-9 mb-6 cursor-pointer hover:scale-110 transition-transform"
              viewBox="0 0 37 37"
              fill="none"
              onClick={() => navigate("/dashboard")}
            >
              <path
                d="M7.70825 26.2659H29.2916M7.70825 18.6849H29.2916M7.70825 11.104H20.0416"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* Globe icon */}
            <svg
              className="w-9 h-10 mb-6 cursor-pointer hover:scale-110 transition-transform"
              viewBox="0 0 37 40"
              fill="none"
            >
              <path
                d="M6 19.9106H13.2222M6 19.9106C6 27.0903 11.8203 32.9106 19 32.9106M6 19.9106C6 12.7309 11.8203 6.91064 19 6.91064M13.2222 19.9106H24.7778M13.2222 19.9106C13.2222 27.0903 15.809 32.9106 19 32.9106M13.2222 19.9106C13.2222 12.7309 15.809 6.91064 19 6.91064M24.7778 19.9106H32M24.7778 19.9106C24.7778 12.7309 22.191 6.91064 19 6.91064M24.7778 19.9106C24.7778 27.0903 22.191 32.9106 19 32.9106M32 19.9106C32 12.7309 26.1797 6.91064 19 6.91064M32 19.9106C32 27.0903 26.1797 32.9106 19 32.9106"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* Chat icon */}
            <svg
              className="w-9 h-9 mb-auto cursor-pointer hover:scale-110 transition-transform"
              viewBox="0 0 37 38"
              fill="none"
            >
              <path
                d="M24.6667 12.8857H30.8333C31.6848 12.8857 32.375 13.584 32.375 14.4452V31.5998L27.2366 27.2815C26.9598 27.0489 26.6103 26.9213 26.2505 26.9213H13.875C13.0236 26.9213 12.3333 26.2231 12.3333 25.3618V20.6833M24.6667 12.8857V8.20721C24.6667 7.34592 23.9764 6.64771 23.125 6.64771H6.16667C5.31523 6.64771 4.625 7.34592 4.625 8.20721V25.3623L9.76339 21.0432C10.0402 20.8106 10.3897 20.6833 10.7495 20.6833H12.3333M24.6667 12.8857V19.1238C24.6667 19.9851 23.9764 20.6833 23.125 20.6833H12.3333"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* User avatar */}
            <div className="relative">
              <div className="w-12 h-12 bg-white rounded-full overflow-hidden flex items-center justify-center">
                {(isEditing ? tempData.profilePicture : profileData.profilePicture) ? (
                  <img
                    src={(isEditing ? tempData.profilePicture : profileData.profilePicture) as string}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-medium text-black/70">
                    {(isEditing ? tempData.fullName : profileData.fullName)?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div
          className="ml-24 sm:ml-28 md:ml-32 lg:ml-36 xl:ml-40 pt-24 max-w-full overflow-x-hidden break-words"
          style={{ wordWrap: "break-word", overflowWrap: "break-word" }}
        >
          {/* Profile Header with profile picture and name */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-8 mb-12 max-w-full overflow-x-hidden">
            {/* Profile Picture and Name Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 flex-1 min-w-0">

              {/* Profile Image */}
              <div className="flex-shrink-0 relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-56 xl:h-56 bg-gray-300 rounded-full overflow-hidden relative group">
                  { (isEditing ? tempData.profilePicture : profileData.profilePicture) ? (
                    <img
                      src={(isEditing ? tempData.profilePicture : profileData.profilePicture) as string}
                      alt="profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                      <span className="text-4xl sm:text-5xl md:text-6xl font-medium text-black/70">
                        {(isEditing ? tempData.fullName : profileData.fullName)?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}

                  {/* Edit overlay - only show when editing or on hover */}
                  {(isEditing || isEditingProfilePic) && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                      <div className="flex flex-col items-center gap-2">
                        <label
                          htmlFor="profile-picture-upload"
                          className="cursor-pointer bg-white bg-opacity-90 hover:bg-opacity-100 text-black px-3 py-1 rounded-full text-xs font-medium transition-all"
                        >
                          📷 Change
                        </label>
                        {(isEditing ? !!tempData.profilePicture : !!profileData.profilePicture) && (
                          <button
                            onClick={handleRemoveProfilePicture}
                            className="bg-red-500 bg-opacity-90 hover:bg-opacity-100 text-white px-3 py-1 rounded-full text-xs font-medium transition-all"
                          >
                            🗑️ Remove
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Show edit button when not in editing mode but hovering */}
                  {!isEditing && !isEditingProfilePic && (
                    <div
                      className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer"
                      onClick={() => setIsEditingProfilePic(true)}
                    >
                      <span className="opacity-0 group-hover:opacity-100 bg-white bg-opacity-90 text-black px-3 py-1 rounded-full text-xs font-medium transition-all">
                        📷 Edit
                      </span>
                    </div>
                  )}
                </div>

                {/* Hidden file input */}
                <input
                  id="profile-picture-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />

                {/* Cancel edit button when editing profile pic only */}
                {isEditingProfilePic && !isEditing && (
                  <button
                    onClick={() => setIsEditingProfilePic(false)}
                    className="absolute -bottom-2 -right-2 bg-gray-200 hover:bg-gray-300 text-black rounded-full w-8 h-8 flex items-center justify-center text-sm transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-4 min-w-0 max-w-full">
                <div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempData.fullName}
                      onChange={(e) =>
                        setTempData((prev) => ({
                          ...prev,
                          fullName: e.target.value,
                        }))
                      }
                      className={`${getDynamicNameSize(tempData.fullName)} font-medium text-black mb-2 bg-transparent outline-none w-full max-w-full box-border break-words`}
                      style={{
                        fontFamily: "Roboto Flex, sans-serif",
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                      }}
                    />
                  ) : (
                    <h1
                      className={`${getDynamicNameSize(data.fullName)} font-medium text-black mb-2 break-words`}
                      style={{
                        fontFamily: "Roboto Flex, sans-serif",
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                        wordBreak: "break-word",
                      }}
                    >
                      {data.fullName}
                    </h1>
                  )}

                  {isEditing ? (
                    <div>
                      <input
                        type="text"
                        value={tempData.username}
                        onChange={(e) =>
                          setTempData((prev) => ({
                            ...prev,
                            username: e.target.value,
                          }))
                        }
                        className={`${getDynamicUsernameSize(tempData.username)} text-black/70 mb-1 bg-transparent outline-none w-full max-w-xs`}
                      />
                      {!tempData.username && (
                        <p className="text-xs text-gray-500 mb-3 italic">
                          Choose a unique username (e.g., @your_handle). This
                          will be how others can find and mention you.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p
                        className={`${getDynamicUsernameSize(data.username)} text-black/70 mb-1 break-words`}
                        style={{
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                          wordBreak: "break-word",
                        }}
                      >
                        {data.username}
                      </p>
                      {!data.username && (
                        <p className="text-xs text-gray-500 mb-3 italic">
                          Choose a unique username (e.g., @your_handle). This
                          will be how others can find and mention you.
                        </p>
                      )}
                    </div>
                  )}
                  <div className="mb-4">
                    <div
                      className={`flex flex-wrap items-center gap-2 ${getDynamicUniversitySize(`${data.university} ${data.degree} ${data.year}`)} text-black/80 mb-1`}
                    >
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            value={tempData.university}
                            onChange={(e) =>
                              setTempData((prev) => ({
                                ...prev,
                                university: e.target.value,
                              }))
                            }
                            className="bg-transparent outline-none max-w-[180px] flex-shrink"
                            placeholder="University"
                          />
                          <span className="w-1 h-1 bg-gray-400 rounded-full flex-shrink-0"></span>
                          <input
                            type="text"
                            value={tempData.degree}
                            onChange={(e) =>
                              setTempData((prev) => ({
                                ...prev,
                                degree: e.target.value,
                              }))
                            }
                            className="bg-transparent outline-none max-w-[160px] flex-shrink"
                            placeholder="Degree"
                          />
                          <span className="w-1 h-1 bg-gray-400 rounded-full flex-shrink-0"></span>
                          <input
                            type="text"
                            value={tempData.year}
                            onChange={(e) =>
                              setTempData((prev) => ({
                                ...prev,
                                year: e.target.value,
                              }))
                            }
                            className="bg-transparent outline-none max-w-[80px] flex-shrink"
                            placeholder="Year"
                          />
                        </>
                      ) : (
                        <>
                          <span>{data.university}</span>
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          <span>{data.degree}</span>
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          <span>{data.year}</span>
                        </>
                      )}
                    </div>
                    {!tempData.university &&
                      !tempData.degree &&
                      !tempData.year && (
                        <p className="text-xs text-gray-500 mb-3 italic">
                          Add your educational background: university name,
                          degree program, and current year/graduation year.
                        </p>
                      )}
                  </div>
                  <div className="mb-4">
                    {isEditing ? (
                      <textarea
                        value={tempData.quote}
                        onChange={(e) =>
                          setTempData((prev) => ({
                            ...prev,
                            quote: e.target.value,
                          }))
                        }
                        className={`${getDynamicQuoteSize(tempData.quote)} italic text-gray-600 mb-1 max-w-full bg-transparent outline-none p-2 w-full resize-none break-words`}
                        rows={2}
                        placeholder="Your quote..."
                        style={{
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                          wordBreak: "break-word",
                        }}
                      />
                    ) : (
                      <p
                        className={`${getDynamicQuoteSize(data.quote)} italic text-gray-600 mb-1 max-w-md break-words`}
                        style={{
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                          wordBreak: "break-word",
                        }}
                      >
                        "{data.quote}"
                      </p>
                    )}
                    {!tempData.quote && (
                      <p className="text-xs text-gray-500 mb-4 italic">
                        Share a personal motto, inspiring quote, or tagline that
                        represents your values and personality.
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 text-sm bg-yellow-100 text-black rounded-full hover:bg-yellow-200 transition-colors">
                      Message +
                    </button>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-[rgba(192,206,255,0.87)] text-black rounded-full hover:bg-[rgba(182,196,245,0.87)] transition-colors"
                      >
                        Edit
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5.66682 2.55556H3.48904C2.61785 2.55556 2.18193 2.55556 1.84918 2.7251C1.55648 2.87424 1.31868 3.11203 1.16955 3.40473C1 3.73748 1 4.1734 1 5.0446V12.5113C1 13.3825 1 13.8178 1.16955 14.1506C1.31868 14.4433 1.55648 14.6815 1.84918 14.8306C2.1816 15 2.617 15 3.48649 15H10.958C11.8274 15 12.2622 15 12.5946 14.8306C12.8873 14.6815 13.1259 14.443 13.2751 14.1504C13.4444 13.8179 13.4444 13.383 13.4444 12.5135V10.3333M10.3333 3.33333L5.66667 8V10.3333H8L12.6667 5.66667M10.3333 3.33333L12.6667 1L15 3.33333L12.6667 5.66667M10.3333 3.33333L12.6667 5.66667" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleCancel}
                          className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-200 text-black rounded-full hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 4L4 12M4 4L12 12" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button
                          onClick={handleSave}
                          className="flex items-center gap-2 px-4 py-2 text-sm bg-green-200 text-black rounded-full hover:bg-green-300 transition-colors"
                        >
                          Save
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13.5 4.5L6 12L2.5 8.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right sidebar info */}
            <div className="text-right space-y-4 flex-shrink-0">
              <div>
                <h3 className="text-lg font-normal text-black mb-2">
                  Resume / CV
                </h3>
                <a
                  href="#"
                  className="text-blue-500 hover:text-blue-600 text-sm underline"
                >
                  View_Resume.pdf
                </a>
              </div>
              <div>
                <h3 className="text-lg font-medium text-black mb-2">
                  Social Handles
                </h3>
                <div className="space-x-4">
                  <a
                    href="#"
                    className="text-black hover:text-gray-700 text-sm underline"
                  >
                    LinkedIn
                  </a>
                  <a
                    href="#"
                    className="text-black hover:text-gray-700 text-sm underline"
                  >
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* About Me */}
          <section className="mb-8 lg:mb-12 max-w-full overflow-x-hidden">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-black mb-4 lg:mb-6 flex items-center">
              💬 About Me
            </h2>
            {isEditing ? (
              <textarea
                value={tempData.aboutMe}
                onChange={(e) =>
                  setTempData((prev) => ({ ...prev, aboutMe: e.target.value }))
                }
                className="text-sm sm:text-base lg:text-lg text-black leading-relaxed w-full max-w-full bg-transparent outline-none p-4 resize-none box-border break-words"
                rows={4}
                placeholder="Tell us about yourself..."
                style={{
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                }}
              />
            ) : (
              <>
                {data.aboutMe && data.aboutMe.trim() ? (
                  <p
                    className="text-sm sm:text-base lg:text-lg text-black leading-relaxed break-words"
                    style={{
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                      wordBreak: "break-word",
                    }}
                  >
                    {data.aboutMe}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 italic leading-relaxed">
                    This is where you can share your story! Tell others about your background, interests, goals, and what drives you.
                    Share your passions, experiences, and what makes you unique. This personal touch helps others connect with you and
                    understand who you are beyond your professional achievements.
                  </p>
                )}
              </>
            )}
          </section>

          {/* Academic & Professional */}
          <section className="mb-8 lg:mb-12 max-w-full overflow-x-hidden">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-black mb-6 lg:mb-8">
              💼 Academic & Professional
            </h2>

            {/* Show inspiring quote when all sections are empty and not editing */}
            {!isEditing &&
             !hasSkills &&
             !hasProjects &&
             !hasCertifications &&
             !hasLanguages &&
             !hasEvents &&
             !hasHobbies && (
              <div className="text-center py-12 px-6">
                <div className="text-6xl mb-6">🚀</div>
                <h3 className="text-xl sm:text-2xl font-medium text-gray-800 mb-4">
                  Ready to showcase your journey?
                </h3>
                <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
                  "Every expert was once a beginner. Every professional was once an amateur.
                  Every icon was once an unknown."
                </p>
                <p className="text-sm text-gray-500 italic">
                  Click Edit to start building your professional story — add your skills, projects,
                  achievements, and let the world see what makes you unique!
                </p>
              </div>
            )}

            {/* Skills & Interests */}
            {(hasSkills || isEditing) && (
            <div className="mb-6 lg:mb-8">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-medium text-black mb-3 lg:mb-4">
                Skills & Interests
              </h3>
              {data.skills.length === 0 && (
                <p className="text-xs text-gray-500 mb-3 italic">
                  List your technical skills, programming languages, tools,
                  frameworks, and areas of interest. Add skills that showcase
                  your expertise.
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                {(isEditing ? data.skills : data.skills.filter(s => s.trim() !== "")).map((skill, index) => (
                  <div key={index} className="flex items-center">
                    {isEditing ? (
                      <div className="flex items-center bg-blue-100 rounded-full px-4 py-2">
                        <input
                          type="text"
                          value={skill}
                          onChange={(e) => {
                            const newSkills = [...tempData.skills];
                            newSkills[index] = e.target.value;
                            setTempData((prev) => ({
                              ...prev,
                              skills: newSkills,
                            }));
                          }}
                          className="bg-transparent text-black text-sm outline-none max-w-[120px]"
                          placeholder="Skill"
                        />
                        <button
                          onClick={() => {
                            const newSkills = tempData.skills.filter(
                              (_, i) => i !== index,
                            );
                            setTempData((prev) => ({
                              ...prev,
                              skills: newSkills,
                            }));
                          }}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <span
                        className="px-4 py-2 bg-blue-100 text-black rounded-full text-sm break-words"
                        style={{
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                          wordBreak: "break-word",
                        }}
                      >
                        {skill}
                      </span>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <button
                    onClick={() =>
                      setTempData((prev) => ({
                        ...prev,
                        skills: [...prev.skills, ""],
                      }))
                    }
                    className="px-4 py-2 bg-green-100 text-black rounded-full text-sm hover:bg-green-200"
                  >
                    + Add Skill
                  </button>
                )}
              </div>
            </div>
            )}

            {/* Projects */}
            {(hasProjects || isEditing) && (
            <div className="mb-6 lg:mb-8">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-medium text-black mb-3 lg:mb-4">
                📁 Projects
              </h3>
              {data.projects.length === 0 && (
                <p className="text-xs text-gray-500 mb-3 italic">
                  Showcase your notable projects with brief descriptions of what
                  you built, technologies used, and the impact or purpose of
                  each project.
                </p>
              )}
              <div className="grid md:grid-cols-2 gap-4">
                {(isEditing ? data.projects : data.projects.filter(p => (p.title?.trim() || "") !== "" || (p.description?.trim() || "") !== "")).map((project, index) => (
                  <div
                    key={index}
                    className="bg-blue-100 rounded-full p-6 relative"
                  >
                    {isEditing ? (
                      <div>
                        <input
                          type="text"
                          value={project.title}
                          onChange={(e) => {
                            const newProjects = [...tempData.projects];
                            newProjects[index].title = e.target.value;
                            setTempData((prev) => ({
                              ...prev,
                              projects: newProjects,
                            }));
                          }}
                          className="bg-transparent text-black text-sm font-medium outline-none w-full mb-2"
                          placeholder="Project Title"
                        />
                        <textarea
                          value={project.description}
                          onChange={(e) => {
                            const newProjects = [...tempData.projects];
                            newProjects[index].description = e.target.value;
                            setTempData((prev) => ({
                              ...prev,
                              projects: newProjects,
                            }));
                          }}
                          className="bg-transparent text-black text-sm outline-none w-full resize-none break-words"
                          rows={2}
                          placeholder="Project Description"
                          style={{
                            wordWrap: "break-word",
                            overflowWrap: "break-word",
                            wordBreak: "break-word",
                          }}
                        />
                        <button
                          onClick={() => {
                            const newProjects = tempData.projects.filter(
                              (_, i) => i !== index,
                            );
                            setTempData((prev) => ({
                              ...prev,
                              projects: newProjects,
                            }));
                          }}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <p
                        className="text-sm text-black text-center break-words"
                        style={{
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                          wordBreak: "break-word",
                        }}
                      >
                        <strong>{project.title}</strong> – {project.description}
                      </p>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <button
                    onClick={() =>
                      setTempData((prev) => ({
                        ...prev,
                        projects: [
                          ...prev.projects,
                          { title: "", description: "" },
                        ],
                      }))
                    }
                    className="bg-green-100 rounded-full p-6 text-black hover:bg-green-200 text-sm"
                  >
                    + Add Project
                  </button>
                )}
              </div>
            </div>
            )}

            {/* Certifications */}
            {(hasCertifications || isEditing) && (
            <div className="mb-6 lg:mb-8">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-medium text-black mb-3 lg:mb-4">
                📜 Certifications
              </h3>
              {data.certifications.length === 0 && (
                <p className="text-xs text-gray-500 mb-3 italic">
                  List your professional certifications, completed courses, and
                  educational achievements that demonstrate your expertise and
                  commitment to learning.
                </p>
              )}
              <div className="text-sm text-black space-y-2">
                {(isEditing ? data.certifications : data.certifications.filter(s => s.trim() !== "")).map((cert, index) => (
                  <div key={index} className="flex items-center">
                    {isEditing ? (
                      <div className="flex items-center w-full">
                        <input
                          type="text"
                          value={cert}
                          onChange={(e) => {
                            const newCerts = [...tempData.certifications];
                            newCerts[index] = e.target.value;
                            setTempData((prev) => ({
                              ...prev,
                              certifications: newCerts,
                            }));
                          }}
                          className="bg-transparent outline-none flex-1 break-words"
                          placeholder="Certification"
                          style={{
                            wordWrap: "break-word",
                            overflowWrap: "break-word",
                          }}
                        />
                        <button
                          onClick={() => {
                            const newCerts = tempData.certifications.filter(
                              (_, i) => i !== index,
                            );
                            setTempData((prev) => ({
                              ...prev,
                              certifications: newCerts,
                            }));
                          }}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <p
                        className="break-words"
                        style={{
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                          wordBreak: "break-word",
                        }}
                      >
                        {cert}
                      </p>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <button
                    onClick={() =>
                      setTempData((prev) => ({
                        ...prev,
                        certifications: [...prev.certifications, ""],
                      }))
                    }
                    className="text-green-500 hover:text-green-700 text-sm"
                  >
                    + Add Certification
                  </button>
                )}
              </div>
            </div>
            )}

            {/* Languages Known */}
            {(hasLanguages || isEditing) && (
            <div className="mb-6 lg:mb-8">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-medium text-black mb-3 lg:mb-4">
                🌐 Languages Known
              </h3>
              {data.languages.length === 0 && (
                <p className="text-xs text-gray-500 mb-3 italic">
                  Add the languages you speak, read, or write. This helps others
                  understand your communication capabilities and cultural
                  background.
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                {(isEditing ? data.languages : data.languages.filter(s => s.trim() !== "")).map((language, index) => (
                  <div key={index} className="flex items-center">
                    {isEditing ? (
                      <div className="flex items-center bg-blue-100 rounded-full px-4 py-2">
                        <input
                          type="text"
                          value={language}
                          onChange={(e) => {
                            const newLanguages = [...tempData.languages];
                            newLanguages[index] = e.target.value;
                            setTempData((prev) => ({
                              ...prev,
                              languages: newLanguages,
                            }));
                          }}
                          className="bg-transparent text-black text-sm outline-none"
                          placeholder="Language"
                        />
                        <button
                          onClick={() => {
                            const newLanguages = tempData.languages.filter(
                              (_, i) => i !== index,
                            );
                            setTempData((prev) => ({
                              ...prev,
                              languages: newLanguages,
                            }));
                          }}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <span
                        className="px-4 py-2 bg-blue-100 text-black rounded-full text-sm break-words"
                        style={{
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                          wordBreak: "break-word",
                        }}
                      >
                        {language}
                      </span>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <button
                    onClick={() =>
                      setTempData((prev) => ({
                        ...prev,
                        languages: [...prev.languages, ""],
                      }))
                    }
                    className="px-4 py-2 bg-green-100 text-black rounded-full text-sm hover:bg-green-200"
                  >
                    + Add Language
                  </button>
                )}
              </div>
            </div>
            )}

            {/* Events Attended */}
            {(hasEvents || isEditing) && (
            <div className="mb-6 lg:mb-8">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-medium text-black mb-3 lg:mb-4">
                🎯 Events Attended
              </h3>
              {data.events.length === 0 && (
                <p className="text-xs text-gray-500 mb-3 italic">
                  Share conferences, hackathons, workshops, seminars, and other
                  professional or academic events you've participated in or
                  attended.
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                {(isEditing ? data.events : data.events.filter(s => s.trim() !== "")).map((event, index) => (
                  <div key={index} className="flex items-center">
                    {isEditing ? (
                      <div className="flex items-center bg-blue-100 rounded-full px-4 py-2">
                        <input
                          type="text"
                          value={event}
                          onChange={(e) => {
                            const newEvents = [...tempData.events];
                            newEvents[index] = e.target.value;
                            setTempData((prev) => ({
                              ...prev,
                              events: newEvents,
                            }));
                          }}
                          className="bg-transparent text-black text-sm outline-none"
                          placeholder="Event"
                        />
                        <button
                          onClick={() => {
                            const newEvents = tempData.events.filter(
                              (_, i) => i !== index,
                            );
                            setTempData((prev) => ({
                              ...prev,
                              events: newEvents,
                            }));
                          }}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <span
                        className="px-4 py-2 bg-blue-100 text-black rounded-full text-sm font-medium break-words"
                        style={{
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                          wordBreak: "break-word",
                        }}
                      >
                        {event}
                      </span>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <button
                    onClick={() =>
                      setTempData((prev) => ({
                        ...prev,
                        events: [...prev.events, ""],
                      }))
                    }
                    className="px-4 py-2 bg-green-100 text-black rounded-full text-sm hover:bg-green-200"
                  >
                    + Add Event
                  </button>
                )}
              </div>
            </div>
            )}

            {/* Hobbies & Passions */}
            {(hasHobbies || isEditing) && (
            <div className="mb-6 lg:mb-8">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-medium text-black mb-3 lg:mb-4">
                🎨 Hobbies & Passions
              </h3>
              {data.hobbies.length === 0 && (
                <p className="text-xs text-gray-500 mb-3 italic">
                  Share your personal interests, creative pursuits, sports, and
                  activities you enjoy outside of work or academics. This shows
                  your personality!
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                {(isEditing ? data.hobbies : data.hobbies.filter(s => s.trim() !== "")).map((hobby, index) => (
                  <div key={index} className="flex items-center">
                    {isEditing ? (
                      <div className="flex items-center bg-blue-100 rounded-full px-4 py-2">
                        <input
                          type="text"
                          value={hobby}
                          onChange={(e) => {
                            const newHobbies = [...tempData.hobbies];
                            newHobbies[index] = e.target.value;
                            setTempData((prev) => ({
                              ...prev,
                              hobbies: newHobbies,
                            }));
                          }}
                          className="bg-transparent text-black text-sm outline-none"
                          placeholder="Hobby"
                        />
                        <button
                          onClick={() => {
                            const newHobbies = tempData.hobbies.filter(
                              (_, i) => i !== index,
                            );
                            setTempData((prev) => ({
                              ...prev,
                              hobbies: newHobbies,
                            }));
                          }}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <span
                        className="px-4 py-2 bg-blue-100 text-black rounded-full text-sm font-medium break-words"
                        style={{
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                          wordBreak: "break-word",
                        }}
                      >
                        {hobby}
                      </span>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <button
                    onClick={() =>
                      setTempData((prev) => ({
                        ...prev,
                        hobbies: [...prev.hobbies, ""],
                      }))
                    }
                    className="px-4 py-2 bg-green-100 text-black rounded-full text-sm hover:bg-green-200"
                  >
                    + Add Hobby
                  </button>
                )}
              </div>
            </div>
            )}
          </section>
        </div>
      </div>

      {/* Logout Button */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 shadow-lg"
        >
          Logout
        </button>
      </div>

      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={showCropModal}
        imageSrc={selectedImageSrc}
        onSave={handleCropSave}
        onCancel={handleCropCancel}
      />
    </div>
  );
}
