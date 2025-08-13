import React, { useState, useEffect } from "react";
import { Clock, ExternalLink, Copy, Check } from "lucide-react";

const MessageUtils = {
  formatDateTime: (timestamp) => {
    const utcDate = new Date(timestamp);
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    };

    const indianTime = new Intl.DateTimeFormat('en-IN', options).format(utcDate);
    const day = utcDate.toLocaleDateString('en-US', { weekday: 'long' });

    return {
      fullDate: indianTime,
      timeZone: "IST",
      dayName: day,
      date: utcDate.getDate(),
      month: utcDate.toLocaleDateString('en-US', { month: 'long' }),
      time: indianTime.split('at')[1].trim()
    };
  },

  formatDuration: (durationSeconds) => {
    const hours = Math.floor(durationSeconds / 3600);
    const minutes = Math.floor((durationSeconds % 3600) / 60);

    if (hours > 0 && minutes > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    return '0 minutes';
  },

  toFancyText: (text) => {
    const fancyChars = {
      'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈',
      'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑',
      'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
      'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢',
      'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫',
      's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳',
      '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗'
    };
    return text.split('').map(char => fancyChars[char] || char).join('');
  }
};

const CopyButton = ({ onClick, copied, type, color }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm
      ${color.accentLight} ${color.button} transition-colors duration-200`}
  >
    {copied ? (
      <>
        <Check size={14} className="mr-1.5" />
        Copied {type}
      </>
    ) : (
      <>
        <Copy size={14} className="mr-1.5" />
        Copy {type}
      </>
    )}
  </button>
);
const getOrdinalSuffix = (day) => {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = day % 100;
  return day + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
};
const MessageGenerator = {
  generateWhatsAppMessage: (contest, startDateTime) => {
    const formattedDuration = MessageUtils.formatDuration(contest.duration);
    const date = `${getOrdinalSuffix(startDateTime.date)} ${startDateTime.month}, ${new Date(contest.startTime).getFullYear()}`;
    const time = startDateTime.time;

    switch (contest.site.toLowerCase()) {
      case "codechef":
        return `Codechef ${contest.title} will start on ${date} at ${time} IST.\nContest duration is ${formattedDuration}.\n\nContest link: ${contest.url}\nHappy Coding! 😀`;
      case "codeforces":
        return `${contest.title} will start on ${date} at ${time} IST.\nContest duration is ${formattedDuration}.\n\nContest link: ${contest.url}\nHappy Coding! 😀`;
      case "atcoder":
        return `${contest.title} will start on ${date} at ${time} IST.\nContest duration is ${formattedDuration}.\n\nContest link: ${contest.url}\nHappy Coding! 😀`;
      default:
        return contest.title;
    }
  },

  generateFacebookMessage: (contest, dateInfo) => {
    const fancyTitle = MessageUtils.toFancyText(contest.title);
    const fancyDate = MessageUtils.toFancyText(`${getOrdinalSuffix(dateInfo.date)} ${dateInfo.month}, ${dateInfo.dayName}, ${new Date(contest.startTime).getFullYear()}`);
    const fancyTime = MessageUtils.toFancyText(dateInfo.time.replace(' IST', ''));
    const duration = MessageUtils.toFancyText(MessageUtils.formatDuration(contest.duration));
    switch (contest.site.toLowerCase()) {
      case "codechef":
        return `Upcoming Contest: ${MessageUtils.toFancyText('Codechef ' + contest.title)}\nDate: ${fancyDate}\nContest Timing: ${fancyTime} 𝐈𝐒𝐓\nDuration: ${duration}\nContest link: ${contest.url}\n\nHappy Coding! 😀`;
      case "codeforces":
        return `Upcoming Contest: ${fancyTitle}\nDate: ${fancyDate}\nContest Timing: ${fancyTime} 𝐈𝐒𝐓\nDuration: ${duration}\nContest link: ${contest.url}\n\nHappy Coding! 😀`;
      case "atcoder":
        return `Upcoming Contest: ${fancyTitle}\nDate: ${fancyDate}\nContest Timing: ${fancyTime} 𝐈𝐒𝐓\nDuration: ${duration}\nContest link: ${contest.url}\n\nHappy Coding! 😀`;
      default:
        return contest.title;
    }
  }
};
const ContestCard = ({ contest }) => {
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [copiedFacebook, setCopiedFacebook] = useState(false);
  const startDateTime = MessageUtils.formatDateTime(contest.startTime);
  const platform = contest.site.toLowerCase();
  const colors = platformConfig[platform];

  const handleCopy = async (type) => {
    const message = type === 'WhatsApp'
      ? MessageGenerator.generateWhatsAppMessage(contest, startDateTime)
      : MessageGenerator.generateFacebookMessage(contest, startDateTime);

    await navigator.clipboard.writeText(message);
    if (type === 'WhatsApp') {
      setCopiedWhatsApp(true);
      setTimeout(() => setCopiedWhatsApp(false), 2000);
    } else {
      setCopiedFacebook(true);
      setTimeout(() => setCopiedFacebook(false), 2000);
    }
  };

  return (
    <div className={`relative rounded-xl bg-gradient-to-br ${colors.gradient} 
      border border-gray-800 backdrop-blur-sm transition-all duration-300 
      hover:shadow-lg hover:shadow-black/5 hover:border-gray-700`}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className={`text-xl font-semibold ${colors.accentLight}`}>
              {contest.site.toUpperCase()}
            </h3>
            <div className="flex items-center mt-2 text-gray-400">
              <Clock size={14} className="mr-1.5" />
              <span className="text-sm">{startDateTime.fullDate}</span>
            </div>
          </div>
          <span className="px-3 py-1 text-sm bg-black/20 rounded-full text-gray-300">
            {MessageUtils.formatDuration(contest.duration)}
          </span>
        </div>

        <div className="mt-4 space-y-4">
          <div className="bg-black/20 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">WhatsApp Format</h4>
            <p className="text-white text-sm whitespace-pre-line">
              {MessageGenerator.generateWhatsAppMessage(contest, startDateTime)}
            </p>
          </div>

          <div className="bg-black/20 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Facebook Format</h4>
            <p className="text-white text-sm whitespace-pre-line">
              {MessageGenerator.generateFacebookMessage(contest, startDateTime)}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <CopyButton
            onClick={() => handleCopy('WhatsApp')}
            copied={copiedWhatsApp}
            type="WhatsApp"
            color={colors}
          />

          <CopyButton
            onClick={() => handleCopy('Facebook')}
            copied={copiedFacebook}
            type="Facebook"
            color={colors}
          />

          <a
            href={contest.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm
              ${colors.accentLight} ${colors.button} transition-colors duration-200`}
          >
            Contest Link
            <ExternalLink size={14} className="ml-1.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
const platformConfig = {
  codechef: {
    gradient: "from-green-500/10 to-green-500/5",
    border: "#4CAF50",
    accentLight: "text-green-400",
    accentHover: "hover:text-green-300",
    button: "hover:bg-green-500/10",
  },
  codeforces: {
    gradient: "from-blue-500/10 to-blue-500/5",
    border: "#1565C0",
    accentLight: "text-blue-400",
    accentHover: "hover:text-blue-300",
    button: "hover:bg-blue-500/10",
  },
  atcoder: {
    gradient: "from-purple-500/10 to-purple-500/5",
    border: "#9C27B0",
    accentLight: "text-purple-400",
    accentHover: "hover:text-purple-300",
    button: "hover:bg-purple-500/10",
  }
};

const ContestList = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const CACHE_KEY = 'contestData';
  const CACHE_DURATION = 1800000;

  useEffect(() => {
    const fetchAllContests = async () => {
      try {
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          if (Date.now() - timestamp < CACHE_DURATION) {
            const filteredCachedData = data.map(contest => {
              if (contest.site === 'AtCoder') {
                return contest.title.toLowerCase().includes('beginner contest') ? contest : null;
              }
              return contest;
            }).filter(Boolean);

            setContests(filteredCachedData);
            setLoading(false);
            return;
          }
        }

        const currentDate = new Date().toISOString().slice(0, 19).replace(/:/g, '%3A');
        const platforms = [
          { id: 93, name: 'AtCoder' },
          { id: 1, name: 'Codeforces' },
          { id: 2, name: 'CodeChef' }
        ];

        const responses = await Promise.all(
          platforms.map(platform =>
            fetch(`https://clist.by/api/v1/contest/?api_key=311318ccc97f6fd1d41d57634c270146aeada4a2&resource__id=${platform.id}&end__gt=${currentDate}&username=asishgh`)
          )
        );

        const dataPromises = responses.map(async (response, index) => {
          const data = await response.json();
          return data.objects.map(contest => {
            const utcStartTime = new Date(contest.start + 'Z').getTime();
            return {
              ...contest,
              site: platforms[index].name,
              title: contest.event,
              url: contest.href,
              startTime: utcStartTime,
              duration: contest.duration
            };
          });
        });

        let allContests = (await Promise.all(dataPromises))
          .flat()
          .filter(contest => {
            if (contest.site === 'AtCoder') {
              return contest.title.toLowerCase().includes('beginner contest');
            }
            return true;
          })
          .sort((a, b) => a.startTime - b.startTime);

        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: allContests,
          timestamp: Date.now()
        }));

        setContests(allContests);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAllContests();
  }, []);

  const filteredContests = contests.filter(
    (contest) =>
      selectedPlatform === "all" ||
      contest.site.toLowerCase() === selectedPlatform.toLowerCase()
  );

  const platforms = [
    { id: "all", label: "All Platforms", color: "white" },
    { id: "atcoder", label: "AtCoder", color: "white" },
    { id: "codechef", label: "CodeChef", color: "white" },
    { id: "codeforces", label: "CodeForces", color: "white" }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 mt-10 bg-gray-900">
        Error loading contests: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-12">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-100">
          Upcoming Coding Contests
        </h1>

        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-3 p-1.5 bg-gray-800/50 rounded-xl backdrop-blur-sm">
            {platforms.map(platform => (
              <button
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.id)}
                className={`
                  px-4 py-2 text-sm font-medium rounded-lg
                  transition-all duration-300 ease-in-out
                  ${selectedPlatform === platform.id
                    ? `text-${platform.color} bg-gray-700 shadow-md transform scale-105`
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }
                `}
              >
                {platform.label}
              </button>
            ))}
          </div>
        </div>

        {filteredContests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-gray-600 mb-4">
              <svg
                className="w-16 h-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-lg text-gray-400">
              No upcoming contests found for the selected platform.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContests.map((contest, index) => (
              <ContestCard key={index} contest={contest} />
            ))}
          </div>
        )}

        <footer className="mt-16 pb-8">
          <div className="flex flex-col items-center justify-center gap-2">
            <span className="text-base font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
              © Team RECursion 2026
            </span>
            <p className="text-sm text-gray-500">
              Stay updated with the latest coding competitions
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ContestList;