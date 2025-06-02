import { Link } from "react-router-dom";
import { ArrowRight, Zap, Users, FileText, Calendar, Database, Layers, CheckCircle, Star, Play } from "lucide-react";

const features = [
  {
    icon: <FileText className="h-6 w-6 text-white" />,
    bg: "from-orange-500 to-orange-600",
    title: "Rich Text Editor",
    description: "Write with a powerful editor that supports markdown, embeds, and collaborative editing in real-time."
  },
  {
    icon: <Database className="h-6 w-6 text-white" />,
    bg: "from-purple-500 to-purple-600",
    title: "Smart Databases",
    description: "Create custom databases with relations, formulas, and multiple views to organize any type of information."
  },
  {
    icon: <Users className="h-6 w-6 text-white" />,
    bg: "from-green-500 to-green-600",
    title: "Team Collaboration",
    description: "Share pages, assign tasks, and collaborate seamlessly with your team members in real-time."
  }
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-purple-600">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
              Notion Clone
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="#features" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">
              Features
            </Link>
            <Link to="#pricing" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">
              Pricing
            </Link>
            <Link to="#templates" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">
              Templates
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-gray-700 hover:text-orange-600 px-3 py-2 text-sm font-medium">
              Sign In
            </Link>
            <Link 
              to="/signup" 
              className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container px-4 py-16 md:py-24 lg:py-32">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="bg-orange-100 text-orange-700 border border-orange-200 px-3 py-1 rounded-full text-sm font-medium flex items-center">
              <Star className="h-3 w-3 mr-1" />
              Trusted by 50,000+ teams worldwide
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl">
              Your ideas deserve a
              <span className="bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
                {" "}better workspace
              </span>
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
              Write, plan, organize, and collaborate. Notion Clone brings all your thoughts and projects together in one
              beautiful, intuitive platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <input 
                placeholder="Enter your email" 
                className="flex-1 h-12 px-4 border border-gray-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <button className="h-12 px-8 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white rounded-md font-medium flex items-center justify-center">
                Start Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Free forever
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                No credit card required
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-white">
          <div className="container px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Everything you need to
                <span className="bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
                  {" "}stay organized
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                From quick notes to complex projects, Notion Clone adapts to your workflow with powerful, flexible tools.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl overflow-hidden">
                  <div className="p-8">
                    <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${feature.bg} flex items-center justify-center mb-6`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-gradient-to-r from-orange-500 to-purple-600">
          <div className="container px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to transform your workflow?</h2>
            <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
              Join thousands of teams who have already made the switch to a better way of working.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <button className="h-12 px-8 bg-white text-gray-900 hover:bg-gray-100 rounded-md font-medium">
                Start Free Trial
              </button>
              <button className="h-12 px-8 border-2 border-white text-white hover:bg-white hover:text-gray-900 rounded-md font-medium transition-colors">
                Schedule Demo
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-purple-600">
                  <Layers className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">Notion Clone</span>
              </div>
              <p className="text-gray-400 mb-4">
                The all-in-one workspace for your notes, tasks, wikis, and databases.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="#" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Templates</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Community</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Notion Clone. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
