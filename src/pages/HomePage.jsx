import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import Footer from '../components/Footer';
import LoadingPage from './LoadingPage';

function HomePage() {
  const navigate = useNavigate();
  const { googleSignIn, loading, user } = useAuth();

  const examCategories = [
    { name: 'Competitive Programming', icon: '🏆', color: 'from-yellow-400 to-orange-500' },
    { name: 'Data Structures', icon: '🌳', color: 'from-green-400 to-emerald-500' },
    { name: 'Algorithms', icon: '⚡', color: 'from-blue-400 to-purple-500' },
    { name: 'Database Systems', icon: '🗄️', color: 'from-indigo-400 to-cyan-500' },
    { name: 'Web Development', icon: '🌐', color: 'from-pink-400 to-rose-500' },
    { name: 'System Design', icon: '🏗️', color: 'from-teal-400 to-blue-500' },
  ];

  const gamificationFeatures = [
    { icon: '🎯', title: 'Level Up System', description: 'Gain XP and unlock new challenges' },
    { icon: '🏅', title: 'Achievement Badges', description: 'Collect badges for your accomplishments' },
    { icon: '⚔️', title: 'Code Battles', description: 'Compete with other developers' },
    { icon: '🎮', title: 'Daily Challenges', description: 'Fresh problems every day' },
  ];

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
      navigate('/profile');
    } catch (error) {
      console.error("Google Sign-In failed", error);
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-green-200 rounded-full opacity-25 animate-pulse"></div>
        <div className="absolute bottom-60 right-40 w-24 h-24 bg-yellow-200 rounded-full opacity-20 animate-bounce"></div>
      </div>
      
      <main className="relative flex-grow flex flex-col items-center justify-center z-10 pt-20">
        {/* Hero Section */}
        <div className="text-center px-4 mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-lg">
            <span>🎮</span>
            <span>Level Up Your Skills</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 dark:from-purple-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent leading-tight">
            CodeQuest Arena
          </h1>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
            Gamified Programming Examinations
          </h2>
          <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Turn your coding skills into an epic adventure! Battle through challenging quizzes, earn XP, unlock achievements, and climb the leaderboards in the ultimate programming examination platform.
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <button
                onClick={() => navigate('/profile')}
                className="group relative bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 px-8 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto"
              >
                <span className="flex items-center gap-2">
                  🚀 Enter Your Dashboard
                </span>
              </button>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                className="group relative flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold pl-3 pr-6 py-4 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto"
              >
                <div className="bg-white p-2 rounded-full">
                  <FcGoogle size={24} />
                </div>
                <span>Start Your Quest</span>
              </button>
            )}
            <button
              onClick={() => navigate('/test')}
              className="relative bg-white/90 backdrop-blur-sm text-purple-600 font-bold py-4 px-8 rounded-xl border-2 border-purple-200 hover:bg-purple-50 dark:bg-gray-800/90 dark:text-purple-400 dark:border-purple-400 dark:hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto"
            >
              <span className="flex items-center gap-2">
                📚 Browse Exams
              </span>
            </button>
          </div>
        </div>

        {/* Gamification Features */}
        <section className="w-full max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Why Choose CodeQuest?
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12 text-lg">
            Experience the future of programming education with our game-inspired approach
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {gamificationFeatures.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="text-center">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Exam Categories */}
        <section className="w-full max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Choose Your Battle Arena
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12 text-lg">
            Select from our diverse range of programming examination categories
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {examCategories.map((category, index) => (
              <div
                key={index}
                className="group relative overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                // onClick={() => navigate(`/exams/${category.name.toLowerCase().replace(' ', '-')}`)}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <div className="relative text-center">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {category.name}
                  </h3>
                  {/* <div className="mt-4 inline-flex items-center text-sm text-purple-600 dark:text-purple-400 font-medium">
                    Start Challenge →
                  </div> */}
                </div>
              </div>
            ))}
          </div>
        </section>

       
      </main>

      <div className="relative z-10 w-full">
        <Footer />
      </div>
    </div>
  );
}

export default HomePage;