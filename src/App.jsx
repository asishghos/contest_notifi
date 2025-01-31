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
    <div
      className={`shadow-md rounded-lg p-4 mb-4 border-l-4 transition-all duration-300 ${colors.bg} ${colors.hover}`}
      style={{ borderLeftColor: colors.border }}
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-gray-800">
          {contest.site.toUpperCase()} Contest
        </h2>
        <div className="flex items-center text-gray-600">
          <Clock size={16} className="mr-2" />
          <span className="text-sm">{startDateTime.fullDate}</span>
        </div>
      </div>
      <p className="text-gray-700 mb-4 whitespace-pre-line">
        {generateContestMessage()}
      </p>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Duration: {formatDuration(contest.duration)}
        </span>
        <div className="flex items-center gap-4">
          <button
            onClick={handleCopy}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            {copied ? (
              <Check size={16} className="text-green-500" />
            ) : (
              <Copy size={16} />
            )}
            <span className="ml-2">{copied ? "Copied!" : "Copy"}</span>
          </button>
          <a
            href={contest.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            Contest Link <ExternalLink size={16} className="ml-2" />
          </a>
        </div>
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Upcoming Coding Contests
      </h1>
      <div className="flex justify-center mb-8">
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedPlatform("all")}
            className={`
          px-2 py-1 text-sm rounded-lg transition-all duration-300 ease-in-out
          ${selectedPlatform === "all"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
              }
        `}
          >
            All Platforms
          </button>

          <button
            onClick={() => setSelectedPlatform("atcoder")}
            className={`
          px-2 py-1 text-sm rounded-lg transition-all duration-300 ease-in-out
          ${selectedPlatform === "atcoder"
                ? "bg-pink-600 text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
              }
        `}
          >
            AtCoder
          </button>

          <button
            onClick={() => setSelectedPlatform("codechef")}
            className={`
          px-2 py-1 text-sm rounded-lg transition-all duration-300 ease-in-out
          ${selectedPlatform === "codechef"
                ? "bg-green-600 text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
              }
        `}
          >
            CodeChef
          </button>

          <button
            onClick={() => setSelectedPlatform("codeforces")}
            className={`
          px-2 py-1 text-sm rounded-lg transition-all duration-300 ease-in-out
          ${selectedPlatform === "codeforces"
                ? "bg-blue-800 text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
              }
        `}
          >
            CodeForces
          </button>
        </div>
      </div>

      {filteredContests.length === 0 ? (
        <p className="text-center text-gray-600">
          No upcoming contests found for the selected platform.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContests.map((contest, index) => (
            <ContestCard key={index} contest={contest} />
          ))}
        </div>
      )}
      <div className="text-center mt-12">
        <span className="text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          © Team RECursion
        </span>
      </div>
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
