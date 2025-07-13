


function EndScreen({ score, onRestart }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
        <div className="bg-gray-800 p-10 rounded-3xl shadow-2xl w-full max-w-md text-center">
            <h1 className="text-4xl font-extrabold mb-4">Quiz Complete!</h1>
            <p className="text-xl mb-8">
            Your final score:&nbsp;
            <span className="font-bold text-green-400">{score}</span>
            </p>
            <button
            onClick={onRestart}
            className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-lg mb-4"
            >
            ⟳ Retry
            </button>
            <button
            onClick={onRestart}
            className="w-full py-3 bg-gray-600 hover:bg-gray-500 rounded-xl font-bold text-lg"
            >
            🏠 Main Menu
            </button>
        </div>
        </div>
    );
}

export default EndScreen;