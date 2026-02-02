import React from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Repeat2,
  MoreHorizontal,
  ThumbsUp,
  Bookmark,
  Music2,
  Search,
  ArrowLeft,
  MapPin,
  Link,
  Calendar,
  ChevronRight,
  MoreVertical
} from './Icons';

// --- Helper for formatting numbers ---
const formatCount = num => {
  return num > 999 ? `${(num / 1000).toFixed(1)}k` : num.toString();
};

// --- TWITTER (X) ---
export const TwitterPreview = ({ images, caption, date, mode }) => {
  const avatar = images[0] || 'https://picsum.photos/100/100';

  if (mode === 'avatar') {
    return (
      <div className="bg-black text-white font-sans border border-gray-800 max-w-md mx-auto rounded-none sm:rounded-lg overflow-hidden min-h-[600px] relative">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 w-full p-3 flex justify-between items-center z-10 bg-black/30 backdrop-blur-sm">
          <div className="bg-black/50 p-1 rounded-full">
            <ArrowLeft size={20} />
          </div>
          <div className="flex gap-4">
            <div className="bg-black/50 p-1 rounded-full">
              <Search size={20} />
            </div>
            <div className="bg-black/50 p-1 rounded-full">
              <MoreVertical size={20} />
            </div>
          </div>
        </div>

        {/* Banner */}
        <div className="h-32 bg-gray-700 w-full relative">
          <img src="https://picsum.photos/800/200" className="w-full h-full object-cover opacity-50" alt="banner" />
        </div>

        {/* Profile Header Info */}
        <div className="px-4 relative">
          <div className="flex justify-between items-start">
            {/* Avatar */}
            <div className="-mt-10 relative">
              <img src={avatar} className="w-20 h-20 rounded-full border-4 border-black object-cover" alt="Profile" />
            </div>
            <div className="mt-3">
              <button className="border border-gray-500 rounded-full px-4 py-1.5 text-sm font-bold hover:bg-white/10 transition-colors">
                Edit profile
              </button>
            </div>
          </div>

          <div className="mt-3">
            <h2 className="text-xl font-bold leading-tight">User Name</h2>
            <div className="text-gray-500 text-[15px]">@username</div>
          </div>

          <div className="mt-3 text-[15px] whitespace-pre-wrap leading-snug">
            {caption || 'Digital artist & content creator. 🎨✨ Building things in public.'}
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-gray-500 text-[14px]">
            <div className="flex items-center gap-1">
              <MapPin size={16} />
              <span>San Francisco, CA</span>
            </div>
            <div className="flex items-center gap-1">
              <Link size={16} />
              <span className="text-[#1d9bf0]">social-lens.app</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>Joined September 2012</span>
            </div>
          </div>

          <div className="mt-3 flex gap-4 text-[14px]">
            <div className="hover:underline cursor-pointer">
              <span className="font-bold text-white">248</span>{' '}
              <span className="text-gray-500">Following</span>
            </div>
            <div className="hover:underline cursor-pointer">
              <span className="font-bold text-white">12.4K</span>{' '}
              <span className="text-gray-500">Followers</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 border-b border-gray-800 flex justify-between text-[15px] font-medium text-gray-500">
          <div className="px-4 py-3 text-white border-b-[3px] border-[#1d9bf0] relative">Posts</div>
          <div className="px-4 py-3 hover:bg-white/5 transition-colors">Replies</div>
          <div className="px-4 py-3 hover:bg-white/5 transition-colors">Highlights</div>
          <div className="px-4 py-3 hover:bg-white/5 transition-colors">Media</div>
          <div className="px-4 py-3 hover:bg-white/5 transition-colors">Likes</div>
        </div>

        {/* Fake Tweet */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex gap-3">
            <img src={avatar} className="w-10 h-10 rounded-full object-cover" alt="Av" />
            <div>
              <div className="flex gap-1 text-gray-500 text-[15px]">
                <span className="font-bold text-white">User Name</span> @username · 2h
              </div>
              <div className="text-[15px]">Pinned Tweet 📌</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // POST MODE
  const displayImages = images.slice(0, 4);
  const getImageGridClass = (count, index) => {
    if (count === 1) return 'col-span-2 row-span-2 aspect-[16/9]';
    if (count === 2) return 'col-span-1 row-span-2 aspect-[8/9]';
    if (count === 3) {
      if (index === 0) return 'col-span-1 row-span-2 aspect-[8/9]';
      return 'col-span-1 row-span-1 aspect-[16/9]';
    }
    return 'col-span-1 row-span-1 aspect-[16/9]';
  };

  return (
    <div className="bg-black text-white p-4 font-sans border border-gray-800 max-w-md mx-auto rounded-lg shadow-xl min-h-[200px]">
      <div className="flex gap-3">
        <img src={images[0] || 'https://picsum.photos/100/100'} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between">
            <div className="flex items-center gap-1 truncate">
              <span className="font-bold text-[15px]">User Name</span>
              <span className="text-gray-500 text-[15px]">@username</span>
              <span className="text-gray-500 text-[15px]">· {date}</span>
            </div>
            <MoreHorizontal size={16} className="text-gray-500" />
          </div>

          <div className="mt-1 text-[15px] whitespace-pre-wrap mb-3 leading-snug">
            {caption || "What's happening?"}
          </div>

          {displayImages.length > 0 && (
            <div className={`grid grid-cols-2 gap-0.5 rounded-2xl overflow-hidden border border-gray-800 ${displayImages.length === 1 ? '' : 'aspect-[16/9]'}`}>
              {displayImages.map((img, i) => (
                <div key={i} className={`relative overflow-hidden ${getImageGridClass(displayImages.length, i)}`}>
                  <img src={img} alt={`Post ${i}`} className="absolute inset-0 w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between mt-3 text-gray-500 max-w-[85%]">
            <div className="flex items-center gap-1 group cursor-pointer hover:text-blue-400">
              <MessageCircle size={18} />
              <span className="text-xs">24</span>
            </div>
            <div className="flex items-center gap-1 group cursor-pointer hover:text-green-400">
              <Repeat2 size={18} />
              <span className="text-xs">12</span>
            </div>
            <div className="flex items-center gap-1 group cursor-pointer hover:text-pink-600">
              <Heart size={18} />
              <span className="text-xs">148</span>
            </div>
            <div className="flex items-center gap-1 group cursor-pointer hover:text-blue-400">
              <Share2 size={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- WECHAT (MOMENTS) ---
export const WeChatPreview = ({ images, caption, mode }) => {
  const avatar = images[0] || 'https://picsum.photos/100/100';

  if (mode === 'avatar') {
    return (
      <div className="bg-[#ededed] text-black font-sans border border-gray-200 max-w-md mx-auto rounded-none relative h-[600px] overflow-hidden">
        {/* Header Nav */}
        <div className="h-12 bg-[#ededed] flex items-center justify-between px-3 border-b border-gray-300/50">
          <ArrowLeft size={24} className="text-black" />
          <MoreHorizontal size={24} className="text-black" />
        </div>

        {/* Profile Card */}
        <div className="bg-white mt-0 p-5 pb-8 flex items-start gap-4 border-b border-gray-200">
          <img src={avatar} className="w-16 h-16 rounded-md object-cover bg-gray-100 shrink-0" alt="Av" />
          <div className="flex-1 pt-1">
            <div className="font-bold text-xl text-black">User Name</div>
            <div className="text-gray-500 text-sm mt-1">WeChat ID: wxid_888888</div>
            <div className="text-gray-500 text-sm mt-1">Region: China</div>
          </div>
        </div>

        {/* Bio / Status */}
        {caption && (
          <div className="bg-white mt-3 px-4 py-4 flex items-center justify-between border-y border-gray-200">
            <span className="text-black text-[16px]">Status</span>
            <span className="text-gray-500 text-[14px] flex-1 text-right truncate pl-4">{caption}</span>
            <ChevronRight size={18} className="text-gray-400 ml-2" />
          </div>
        )}

        <div className="bg-white mt-3 border-y border-gray-200">
          <div className="px-4 py-4 flex items-center justify-between active:bg-gray-100">
            <span className="text-black text-[16px]">Moments</span>
            <div className="flex items-center gap-2">
              {images.slice(1, 4).map((img, i) => (
                <img key={i} src={img} className="w-8 h-8 object-cover" alt="m" />
              ))}
              <ChevronRight size={18} className="text-gray-400" />
            </div>
          </div>
          <div className="px-4 py-4 flex items-center justify-between border-t border-gray-100 active:bg-gray-100">
            <span className="text-black text-[16px]">More</span>
            <ChevronRight size={18} className="text-gray-400" />
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="absolute bottom-10 left-0 w-full px-4 flex flex-col gap-3">
          <button className="w-full bg-[#07C160] text-white py-3 rounded-lg font-bold text-[17px] active:bg-[#06ad56]">
            Messages
          </button>
          <button className="w-full bg-white text-[#06ad56] py-3 rounded-lg font-bold text-[17px] active:bg-gray-50 border border-gray-200">
            Audio Call
          </button>
        </div>
      </div>
    );
  }

  // POST MODE
  const displayImages = images.slice(0, 9);
  let gridCols = 'grid-cols-3';
  let imgSize = 'h-24';
  if (displayImages.length === 1) {
    gridCols = 'grid-cols-1';
    imgSize = 'max-w-[70%] h-auto max-h-64';
  } else if (displayImages.length === 4) {
    gridCols = 'grid-cols-2 w-48';
  }

  return (
    <div className="bg-white text-black p-4 font-sans border border-gray-200 max-w-md mx-auto rounded-none relative">
      <div className="bg-[#ededed] h-6 w-full absolute top-0 left-0 flex items-center justify-end px-2 space-x-1">
        <div className="w-3 h-3 bg-black rounded-full opacity-20"></div>
        <div className="w-3 h-3 bg-black rounded-full opacity-20"></div>
      </div>
      <div className="mt-8 flex gap-3">
        <img src={images[0] || 'https://picsum.photos/100/100'} alt="Avatar" className="w-10 h-10 rounded-md object-cover bg-gray-200" />
        <div className="flex-1">
          <div className="text-[#576b95] font-semibold text-[16px] leading-5">User Name</div>
          <div className="text-[15px] text-gray-900 mt-1 mb-2 whitespace-pre-wrap">{caption || 'Share your moments...'}</div>

          {displayImages.length > 0 && (
            <div className={`grid ${gridCols} gap-1.5`}>
              {displayImages.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  className={`object-cover bg-gray-100 ${displayImages.length === 1 ? imgSize : 'w-24 h-24'}`}
                  alt="Moment"
                />
              ))}
            </div>
          )}

          <div className="flex justify-between items-center mt-3">
            <span className="text-gray-400 text-xs">1 min ago</span>
            <div className="bg-[#f7f7f7] px-2 py-1 rounded text-[#576b95]">
              <MoreHorizontal size={16} />
            </div>
          </div>

          <div className="bg-[#f7f7f7] mt-2 rounded p-2 text-[14px]">
            <div className="flex items-center gap-2 text-[#576b95] mb-1">
              <Heart size={14} fill="#576b95" className="text-[#576b95]" />
              <span className="font-semibold text-xs">Friend A, Friend B, Friend C</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- TIKTOK ---
export const TikTokPreview = ({ images, caption, mode }) => {
  const avatar = images[0] || 'https://picsum.photos/100/100';

  if (mode === 'avatar') {
    return (
      <div className="bg-black text-white font-sans border border-gray-800 max-w-md mx-auto rounded-lg h-[650px] overflow-y-auto relative no-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-black z-10 p-3 flex justify-between items-center border-b border-gray-800">
          <div className="w-8"></div>
          <div className="font-bold text-[17px]">User Name</div>
          <div className="w-8 flex justify-end">
            <MoreHorizontal size={24} />
          </div>
        </div>

        <div className="flex flex-col items-center pt-6 pb-4">
          <div className="relative">
            <img src={avatar} className="w-24 h-24 rounded-full border border-gray-800 object-cover" alt="Profile" />
          </div>
          <div className="mt-3 text-[17px] font-bold">@username</div>

          <div className="flex items-center gap-6 mt-4">
            <div className="flex flex-col items-center">
              <span className="font-bold text-[17px]">142</span>
              <span className="text-gray-400 text-[13px]">Following</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-[17px]">84.2K</span>
              <span className="text-gray-400 text-[13px]">Followers</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-[17px]">1.2M</span>
              <span className="text-gray-400 text-[13px]">Likes</span>
            </div>
          </div>

          <div className="flex gap-2 mt-5">
            <button className="bg-[#383838] px-8 py-3 rounded-md text-[15px] font-semibold">Edit profile</button>
            <button className="bg-[#383838] px-3 py-3 rounded-md text-[15px] font-semibold">
              <Share2 size={20} />
            </button>
          </div>

          <div className="mt-5 px-8 text-center text-[14px] leading-relaxed whitespace-pre-wrap">
            {caption || 'Video Creator 🎥\nNew videos every day!\nCheck out the link below 👇'}
          </div>

          <div className="mt-2 text-[#FE2C55] text-[14px] font-semibold flex items-center gap-1">
            <Link size={14} /> link.tree/username
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-gray-800 mt-2">
          <div className="flex-1 flex justify-center py-3 border-b-2 border-white cursor-pointer">
            <MoreVertical className="rotate-90" size={20} />
          </div>
          <div className="flex-1 flex justify-center py-3 text-gray-500 cursor-pointer">
            <Heart size={20} />
          </div>
          <div className="flex-1 flex justify-center py-3 text-gray-500 cursor-pointer">
            <Bookmark size={20} />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-0.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <div key={n} className="aspect-[3/4] bg-gray-900 relative">
              <div className="absolute bottom-1 left-1 flex items-center gap-1 text-white text-xs font-semibold">
                <span className="text-sm">▶</span> {formatCount(100 + n)}K
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // POST MODE
  const currentImage = images[0] || 'https://picsum.photos/400/800';
  return (
    <div className="bg-black text-white font-sans overflow-hidden max-w-xs mx-auto h-[600px] relative rounded-lg border border-gray-800">
      <img src={currentImage} className="w-full h-full object-cover opacity-90" alt="TikTok" />
      {images.length > 1 && (
        <div className="absolute top-4 right-4 bg-black/40 px-3 py-1 rounded-full text-xs backdrop-blur-sm">
          1/{images.length}
        </div>
      )}
      <div className="absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-b from-black/20 via-transparent to-black/60">
        <div className="flex justify-center pt-2">
          <div className="text-base font-semibold border-b-2 border-white pb-1">Following</div>
          <div className="text-base font-semibold text-gray-400 ml-4">For You</div>
        </div>
        <div className="absolute right-2 bottom-24 flex flex-col items-center gap-5">
          <div className="relative">
            <img src={images[0] || 'https://picsum.photos/100/100'} className="w-11 h-11 rounded-full border-2 border-white object-cover" alt="Av" />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#FE2C55] rounded-full p-0.5">
              <div className="w-2 h-2 text-white flex items-center justify-center">+</div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Heart size={32} className="text-white drop-shadow-md" fill="rgba(255,255,255,0.2)" />
            <span className="text-xs font-semibold">84.2K</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <MessageCircle size={32} className="text-white drop-shadow-md" fill="white" fillOpacity={0.9} />
            <span className="text-xs font-semibold">1024</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Bookmark size={32} className="text-white drop-shadow-md" fill="white" fillOpacity={0.9} />
            <span className="text-xs font-semibold">405</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Share2 size={32} className="text-white drop-shadow-md" fill="white" fillOpacity={0.5} />
            <span className="text-xs font-semibold">Share</span>
          </div>
        </div>
        <div className="mb-4 max-w-[80%]">
          <div className="font-semibold text-base mb-2 drop-shadow-md">@username</div>
          <div className="text-sm opacity-90 leading-tight drop-shadow-md mb-3 line-clamp-2">
            {caption || 'Check out this amazing view! #viral #fyp #trending'}
          </div>
          <div className="flex items-center gap-2 text-xs font-medium">
            <Music2 size={14} />
            <div className="w-24 overflow-hidden whitespace-nowrap">Original Sound - User Name</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- BILIBILI ---
export const BilibiliPreview = ({ images, caption, date, mode }) => {
  const avatar = images[0] || 'https://picsum.photos/100/100';

  if (mode === 'avatar') {
    return (
      <div className="bg-white text-black font-sans border border-gray-200 max-w-md mx-auto rounded-lg overflow-hidden relative">
        {/* Top Nav */}
        <div className="h-12 bg-white flex items-center justify-end px-3 absolute top-0 w-full z-10 bg-transparent">
          <div className="flex gap-4 text-white drop-shadow-md">
            <Share2 size={22} />
            <MoreHorizontal size={22} />
          </div>
        </div>

        {/* Banner */}
        <div className="h-32 bg-[#fb7299] w-full relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        {/* Profile Header */}
        <div className="px-4 relative pb-4">
          <div className="flex justify-between items-end -mt-4">
            <div className="relative">
              <img src={avatar} className="w-20 h-20 rounded-full border-2 border-white object-cover" alt="Av" />
              <div className="absolute bottom-0 right-0 bg-[#fb7299] text-white text-[10px] px-1 rounded-sm border border-white">Big V</div>
            </div>
            <div className="flex gap-2 mb-2">
              <button className="bg-[#fb7299] text-white px-6 py-1.5 rounded-full text-sm font-medium shadow-sm">Follow</button>
              <button className="border border-gray-300 text-gray-600 px-4 py-1.5 rounded-full text-sm font-medium bg-white">Message</button>
            </div>
          </div>

          <div className="mt-2">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#fb7299]">User Name</h2>
              <span className="text-[10px] border border-gray-300 px-1 rounded text-gray-400">LV6</span>
            </div>
            <div className="text-gray-400 text-xs mt-0.5">Bilibili Creator</div>
          </div>

          <div className="mt-3 text-[13px] text-gray-600 leading-relaxed whitespace-pre-wrap">
            {caption || 'Official account. Tech reviews, coding tutorials, and anime analysis.\nBusiness: email@example.com'}
            <span className="text-[#1E90FF] ml-1">Expand</span>
          </div>

          <div className="flex items-center gap-6 mt-4 text-[14px]">
            <div>
              <span className="font-bold text-black">124</span> <span className="text-gray-400">Following</span>
            </div>
            <div>
              <span className="font-bold text-black">45.2k</span> <span className="text-gray-400">Fans</span>
            </div>
            <div>
              <span className="font-bold text-black">120k</span> <span className="text-gray-400">Likes</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-100 flex text-[14px] text-gray-500">
          <div className="flex-1 text-center py-3 text-[#fb7299] border-b-2 border-[#fb7299]">Home</div>
          <div className="flex-1 text-center py-3">Dynamic</div>
          <div className="flex-1 text-center py-3">Videos</div>
        </div>

        {/* Content Area */}
        <div className="p-2 grid grid-cols-2 gap-2 bg-gray-50">
          <div className="bg-white rounded p-2 h-32"></div>
          <div className="bg-white rounded p-2 h-32"></div>
        </div>
      </div>
    );
  }

  // POST MODE
  const displayImages = images.slice(0, 9);
  return (
    <div className="bg-white text-black p-0 font-sans border border-gray-200 max-w-md mx-auto rounded-lg overflow-hidden">
      <div className="p-4 flex gap-3">
        <div className="relative">
          <img src={images[0] || 'https://picsum.photos/100/100'} className="w-10 h-10 rounded-full border border-gray-100" alt="Avatar" />
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Square_-_black_simple.svg/800px-Square_-_black_simple.svg.png"
            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white text-[#FB7299]"
            style={{
              filter: 'invert(53%) sepia(93%) saturate(3089%) hue-rotate(314deg) brightness(102%) contrast(97%)'
            }}
            alt="vip"
          />
        </div>
        <div className="flex flex-col justify-center">
          <div className="text-[15px] font-medium text-[#FB7299]">User Name</div>
          <div className="text-xs text-gray-400">{date} · Posted via Web</div>
        </div>
      </div>
      <div className="px-4 pb-2">
        <div className="text-[15px] leading-6 mb-3 text-gray-800 whitespace-pre-wrap">{caption || 'New update! Check this out.'}</div>
        {displayImages.length > 0 && (
          <div
            className={`grid ${displayImages.length === 1 ? 'grid-cols-1 max-w-[60%]' : displayImages.length === 4 ? 'grid-cols-2 w-2/3' : 'grid-cols-3'} gap-1.5`}
          >
            {displayImages.map((img, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded bg-gray-100">
                <img src={img} className="w-full h-full object-cover" alt="bili" />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center justify-around py-3 border-t border-gray-100 mt-2">
        <div className="flex items-center gap-1.5 text-gray-500">
          <Share2 size={18} />
          <span className="text-xs">Share</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-500">
          <MessageCircle size={18} />
          <span className="text-xs">42</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-500">
          <ThumbsUp size={18} />
          <span className="text-xs">1.2k</span>
        </div>
      </div>
    </div>
  );
};

// --- YOUTUBE (Community) ---
export const YouTubePreview = ({ images, caption, date, mode }) => {
  const avatar = images[0] || 'https://picsum.photos/100/100';

  if (mode === 'avatar') {
    return (
      <div className="bg-[#0f0f0f] text-white font-sans border border-gray-800 max-w-md mx-auto rounded-none sm:rounded-lg overflow-hidden h-[650px] relative">
        {/* Top Nav */}
        <div className="flex justify-between items-center p-3">
          <ArrowLeft size={24} />
          <div className="flex gap-4">
            <Search size={24} />
            <MoreVertical size={24} />
          </div>
        </div>

        {/* Banner */}
        <div className="h-28 bg-gray-800 w-full overflow-hidden">
          <img src="https://picsum.photos/800/200" className="w-full h-full object-cover opacity-60" alt="banner" />
        </div>

        {/* Info */}
        <div className="flex flex-col items-center px-4 -mt-8 relative z-10">
          <img src={avatar} className="w-20 h-20 rounded-full border-4 border-[#0f0f0f] object-cover" alt="Av" />
          <h1 className="text-2xl font-bold mt-2">User Name</h1>
          <div className="text-gray-400 text-[13px] mt-1 flex items-center gap-1">
            @username • 1.42M subscribers • 420 videos
          </div>
          <div className="text-gray-400 text-[13px] mt-2 text-center leading-snug max-w-xs cursor-pointer flex items-center justify-center gap-1">
            {caption ? caption.slice(0, 80) : 'Welcome to my official channel! I make videos about tech, life, and code.'}...
            <ChevronRight size={14} />
          </div>

          <div className="w-full mt-4 flex items-center justify-center">
            <button className="bg-white text-black w-full max-w-sm py-2 rounded-full font-medium text-sm hover:bg-gray-200 transition-colors">
              Subscribe
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 border-b border-gray-800 flex overflow-x-auto no-scrollbar">
          <div className="px-5 py-3 border-b-2 border-white font-bold text-sm whitespace-nowrap">Home</div>
          <div className="px-5 py-3 text-gray-400 font-medium text-sm whitespace-nowrap">Videos</div>
          <div className="px-5 py-3 text-gray-400 font-medium text-sm whitespace-nowrap">Shorts</div>
          <div className="px-5 py-3 text-gray-400 font-medium text-sm whitespace-nowrap">Playlists</div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="text-sm font-bold mb-3">For You</div>
          <div className="aspect-video bg-gray-800 rounded-xl relative overflow-hidden">
            <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-xs font-medium">12:42</div>
          </div>
          <div className="flex gap-3 mt-3">
            <div className="w-8 h-8 rounded-full bg-gray-700 shrink-0">
              <img src={avatar} className="w-full h-full rounded-full object-cover" alt="av" />
            </div>
            <div>
              <div className="text-sm line-clamp-2">Amazing video title that you must watch right now! 🚀</div>
              <div className="text-xs text-gray-400 mt-1">User Name • 24K views • 2 hours ago</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // POST MODE
  const displayImages = images.slice(0, 1);
  return (
    <div className="bg-[#0f0f0f] text-white p-0 font-sans border border-gray-800 max-w-md mx-auto rounded-none sm:rounded-lg overflow-hidden">
      <div className="p-3 flex justify-between items-start">
        <div className="flex gap-3">
          <img src={images[0] || 'https://picsum.photos/100/100'} className="w-9 h-9 rounded-full" alt="Av" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">User Name</span>
              <span className="text-xs text-gray-400">2 hours ago</span>
            </div>
            <div className="text-sm mt-1 whitespace-pre-wrap">{caption || 'Hey guys! Just uploaded a new video. What do you think?'}</div>
          </div>
        </div>
        <MoreHorizontal size={20} className="text-white rotate-90" />
      </div>
      {displayImages.length > 0 && (
        <div className="w-full aspect-video bg-gray-900 mt-1 relative">
          <img src={displayImages[0]} className="w-full h-full object-contain" alt="YT" />
        </div>
      )}
      <div className="px-3 py-3 flex gap-6">
        <div className="flex items-center gap-2 cursor-pointer">
          <ThumbsUp size={20} />
          <span className="text-sm text-gray-300">2.4K</span>
        </div>
        <div className="flex items-center gap-2 cursor-pointer">
          <ThumbsUp size={20} className="rotate-180" />
        </div>
        <div className="flex items-center gap-2 cursor-pointer">
          <MessageCircle size={20} />
          <span className="text-sm text-gray-300">142</span>
        </div>
      </div>
    </div>
  );
};
