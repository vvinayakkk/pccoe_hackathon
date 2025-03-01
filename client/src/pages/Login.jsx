import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaGoogle, FaFacebookSquare, FaTwitterSquare, FaGithubSquare } from "react-icons/fa";


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const AUTH_BACKEND_URL = import.meta.env.VITE_GOOGLE_AUTH_SERVER;
  const COMPOSIO_API_KEY = import.meta.env.VITE_COMPOSIO_API_KEY;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // try {
    //   const userCredential = await signInWithEmailAndPassword(auth, email, password);
    //   const userDoc = await getDoc(doc(db, "Users", userCredential.user.uid));

    //   if (userDoc.exists()) {
    //     toast.success("User logged in Successfully!!", { position: "top-center" });
    //     navigate("/dashboard");
    //   } else {
    //     await auth.signOut();
    //     toast.error("Account not found. Please register.", { position: "bottom-center" });
    //   }
    // } catch (error) {
    //   toast.error(error.message, { position: "bottom-center" });
    // }
  };

  const handleGoogleAuth = async () => {
    localStorage.setItem('composio-api-key', COMPOSIO_API_KEY);

    try {
      const response = await fetch(`${AUTH_BACKEND_URL}/api-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ api_key: COMPOSIO_API_KEY }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        throw new Error('No redirect URL received');
      }

    } catch (err) {
      console.error("Error:", err);
    } 
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-green-800 mb-6 text-center">Welcome Back</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email address</label>
            <input
              type="email"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Sign In
          </button>
        </form>

        <div className="text-center my-4 text-gray-600">OR</div>

        <button
          onClick={handleGoogleAuth}
          className="w-full py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors flex items-center justify-center gap-2"
        >

          <FaGoogle size={24} className="text-gray-600" />
          Sign in with Google
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          New user? <a href="/register" className="text-green-600 hover:underline">Register Here</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
