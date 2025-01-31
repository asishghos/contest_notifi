import React, { useState, useEffect } from "react";
import { Clock, ExternalLink, Copy, Check } from "lucide-react";

const formatDuration = (durationSeconds) => {
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
};
const formatDateTime = (timestamp) => {
  // Create date object in UTC from the timestamp
  const utcDate = new Date(timestamp);
  const indianTime = new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  }).format(utcDate);

  return {
    fullDate: indianTime,
    timeZone: "IST"
  };
};

const ContestCard = ({ contest }) => {
  const [copied, setCopied] = useState(false);
  const startDateTime = formatDateTime(contest.startTime);
  const cardColors = {
    codechef: {
      border: "#4CAF50",
      bg: "bg-green-50",
      hover: "hover:bg-green-100"
    },
    codeforces: {
      border: "#1565C0",
      bg: "bg-blue-50",
      hover: "hover:bg-blue-100"
    },
    atcoder: {
      border: "#9C27B0",
      bg: "bg-purple-50",
      hover: "hover:bg-purple-100"
    }
  };
  const platform = contest.site.toLowerCase();
  const colors = cardColors[platform];
  const generateContestMessage = () => {
    const formattedDate = `${startDateTime.fullDate} at ${startDateTime.time} ${startDateTime.timeZone}`;
    const formattedDuration = formatDuration(contest.duration);
    switch (contest.site.toLowerCase()) {
      case "codechef":
        return `Codechef ${contest.title} will start on ${formattedDate}.\nContest duration is ${formattedDuration}.\n\nContest link: ${contest.url}\n\nHappy Coding! 😀`;
      case "codeforces":
        return `${contest.title} will start on ${formattedDate}.\nContest duration is ${formattedDuration}.\n\nContest link: ${contest.url}\n\nHappy Coding! 😀`;
      case "atcoder":
        return `${contest.title} will start on ${startDateTime.fullDate
          } at ${startDateTime.time} ${startDateTime.timeZone
          }.\nContest duration is ${formatDuration(
            contest.duration
          )}.\n\nContest link: ${contest.url}\n\nHappy Coding! 😀`;
      default:
        return contest.title;
    }
    // return `${contest.title} will start on ${formattedDate}.\nContest duration is ${formattedDuration}.\n\nContest link: ${contest.url}\nHappy Coding! 😀`;
  };

  const handleCopy = async () => {
    const message = generateContestMessage();
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
      {/* Left border indicator */}
      <div
        className="absolute left-0 top-0 w-2 h-full rounded-l-lg transition-colors duration-300"
        style={{ backgroundColor: colors.border }}
      />

      {/* Header */}
      <div className="p-6 pb-3">
        <div className="flex justify-between items-center gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-gray-900">
              {contest.site.toUpperCase()} Contest
            </h2>
            <div className="flex items-center text-gray-500 text-sm">
              <Clock size={14} className="mr-1.5" />
              <span>{startDateTime.fullDate}</span>
            </div>
          </div>
          <div className="px-2.5 py-1 border border-gray-200 rounded-full text-sm text-gray-600">
            {formatDuration(contest.duration)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4">
        <p className="text-gray-700 whitespace-pre-line leading-relaxed">
          {generateContestMessage()}
        </p>
      </div>

      {/* Footer */}
      <div className="px-6 pt-2 pb-6 flex justify-end gap-2">
        <button
          onClick={handleCopy}
          className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200"
        >
          {copied ? (
            <>
              <Check size={14} className="mr-1.5 text-green-500" />
              Copied
            </>
          ) : (
            <>
              <Copy size={14} className="mr-1.5" />
              Copy
            </>
          )}
        </button>

        <a
          href={contest.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors duration-200"
        >
          Contest Link
          <ExternalLink size={14} className="ml-1.5" />
        </a>
      </div>
    </div>
  );
};

const ContestList = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const CACHE_KEY = 'contestData';
  const CACHE_DURATION = 1800000; // 30 minutes

  useEffect(() => {
    const fetchAllContests = async () => {
      try {
        // Check cache first
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
            // Convert UTC string to timestamp, considering it's in UTC
            const utcStartTime = new Date(contest.start + 'Z').getTime(); // Adding 'Z' to ensure UTC parsing

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

        // Cache the results
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

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-500 mt-10">
        Error loading contests: {error}
      </div>
    );
  const platforms = [
    { id: "all", label: "All Platforms", color: "blue-600" },
    { id: "atcoder", label: "AtCoder", color: "pink-600" },
    { id: "codechef", label: "CodeChef", color: "green-600" },
    { id: "codeforces", label: "CodeForces", color: "blue-800" }
  ];
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">
        Upcoming Coding Contests
      </h1>

      <div className="flex justify-center mb-10">
        <div className="inline-flex items-center gap-3 p-1.5 bg-gray-100 rounded-xl">
          {platforms.map(platform => (
            <button
              key={platform.id}
              onClick={() => setSelectedPlatform(platform.id)}
              className={`
                px-4 py-2 text-sm font-medium rounded-lg
                transition-all duration-300 ease-in-out
                ${selectedPlatform === platform.id
                  ? `bg-${platform.color} text-white shadow-md transform scale-105`
                  : "bg-transparent text-gray-700 hover:bg-white hover:shadow-sm"
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
          <div className="text-gray-400 mb-4">
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
          <p className="text-lg text-gray-600">
            No upcoming contests found for the selected platform.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredContests.map((contest, index) => (
            <ContestCard key={index} contest={contest} />
          ))}
        </div>
      )}

      <footer className="mt-16 pb-8">
        <div className="flex flex-col items-center justify-center gap-2">
          <span className="text-base font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-purple-600 text-transparent bg-clip-text">
            © Team RECursion
          </span>
          <p className="text-sm text-gray-500">
            Stay updated with the latest coding competitions
          </p>
        </div>
      </footer>
    </div>
  );
};

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <ContestList />
    </div>
  );
};

export default App;
