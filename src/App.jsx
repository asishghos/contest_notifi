import React, { useState, useEffect } from "react";
import { Clock, ExternalLink, Copy, Check } from "lucide-react";

const formatDateTime = (timestamp) => {
  const date = new Date(parseInt(timestamp));
  return {
    fullDate: date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
    timeZone: "IST",
  };
};

const formatDuration = (durationMs) => {
  const minutes = Math.floor(durationMs / 60000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} ${remainingMinutes > 0 ? `${remainingMinutes} minutes` : ""
      }`.trim();
  }
  return `${minutes} minutes`;
};

const ContestCard = ({ contest }) => {
  const [copied, setCopied] = useState(false);
  const startDateTime = formatDateTime(contest.startTime);

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
      className="bg-white shadow-md rounded-lg p-4 mb-4 border-l-4 hover:shadow-lg transition-shadow duration-300"
      style={{
        borderLeftColor:
          contest.site === "codechef"
            ? "#4CAF50"
            : contest.site === "codeforces"
              ? "#1565C0"
              : "#9C27B0",
      }}
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

  useEffect(() => {
    const fetchAllContests = async () => {
      try {
        // Fetch contests from both APIs
        const [competeResponse, atcoderResponse] = await Promise.all([
          fetch("https://competeapi.vercel.app/contests/upcoming/"),
          fetch("http://localhost:3001/api/atcoder/contests"),
        ]);

        if (!competeResponse.ok || !atcoderResponse.ok) {
          throw new Error("One or more API requests failed");
        }

        const competeData = await competeResponse.json();
        const atcoderData = await atcoderResponse.json();
        const allContests = [...competeData, ...atcoderData].sort(
          (a, b) => a.startTime - b.startTime
        );

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
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            onClick={() => setSelectedPlatform("all")}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${selectedPlatform === "all"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
              }`}
          >
            All Platforms
          </button>
          <button
            onClick={() => setSelectedPlatform("atcoder")}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${selectedPlatform === "atcoder"
              ? "bg-pink-600 text-white border-pink-600"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
              }`}
          >
            AtCoder
          </button>
          <button
            onClick={() => setSelectedPlatform("codechef")}
            className={`px-4 py-2 text-sm font-medium border-t border-b ${selectedPlatform === "codechef"
              ? "bg-green-600 text-white border-green-600"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
              }`}
          >
            CodeChef
          </button>
          <button
            onClick={() => setSelectedPlatform("codeforces")}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${selectedPlatform === "codeforces"
              ? "bg-blue-800 text-white border-blue-800"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
              }`}
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
