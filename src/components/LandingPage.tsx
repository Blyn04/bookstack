import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, BarChart3, Target, Sparkles } from "lucide-react";

interface LandingPageProps {
  onSignup: () => void; // 👈 add this to connect with the existing signup modal
}

const LandingPage: React.FC<LandingPageProps> = ({ onSignup }) => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <main className="hero">
        <h2>Track Your Reading Journey Effortlessly 📚</h2>
        <p>
          Set goals, record progress, and visualize your reading habits all in one place.
          Stay motivated and make every book count!
        </p>

        {/* 👇 Now triggers same signup modal from Header */}
        <button className="btn large" onClick={onSignup}>
          Get Started
        </button>
      </main>

      <section className="features">
        {[
          {
            icon: <Target className="feature-icon" />,
            title: "Set Reading Goals",
            desc: "Plan your yearly or monthly reading objectives with ease.",
          },
          {
            icon: <BarChart3 className="feature-icon" />,
            title: "Track Insights",
            desc: "View your reading stats and progress visually over time.",
          },
          {
            icon: <Sparkles className="feature-icon" />,
            title: "Personalized Experience",
            desc: "Organize your bookshelf, notes, and achievements seamlessly.",
          },
        ].map((feature, i) => (
          <div key={i} className="feature-card">
            {feature.icon}
            <h3>{feature.title}</h3>
            <p>{feature.desc}</p>
          </div>
        ))}
      </section>

      <footer className="footer">
        © {new Date().getFullYear()} Book Reading Tracker. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
