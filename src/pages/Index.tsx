
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Code, Users, MessageSquare, Heart, Edit } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-fade-in">
                Connect with developers.
                <br />
                <span className="text-accent">Share your code.</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl animate-fade-in [animation-delay:200ms]">
                A social platform built exclusively for developers to share code, 
                connect with peers, and build your professional network.
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start animate-fade-in [animation-delay:400ms]">
                <Button asChild size="lg" className="rounded-full">
                  <Link to="/signup">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full">
                  <Link to="/login">
                    Log In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="flex-1 max-w-md animate-fade-in [animation-delay:600ms]">
              <div className="glass rounded-2xl p-6 md:p-8 backdrop-blur-lg shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <Code className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold">@codemaster</h3>
                    <p className="text-xs text-muted-foreground">Just now</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="mb-3">Just discovered this amazing React hook pattern for managing async state:</p>
                  <pre className="bg-secondary/50 p-3 rounded-md text-sm font-mono overflow-x-auto">
{`const useAsync = (asyncFn, deps = []) => {
  const [state, setState] = useState({
    loading: true,
    error: null,
    data: null
  });
  
  useEffect(() => {
    asyncFn()
      .then(data => setState({ data, loading: false, error: null }))
      .catch(error => setState({ error, loading: false, data: null }));
  }, deps);
  
  return state;
};`}
                  </pre>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4" /> 24
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" /> 8
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Built for developers, by developers
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Edit />}
              title="Share Code Snippets"
              description="Share code snippets, projects, and technical insights with the community."
            />
            <FeatureCard 
              icon={<Users />}
              title="Connect with Peers"
              description="Build your network with like-minded developers and industry professionals."
            />
            <FeatureCard 
              icon={<MessageSquare />}
              title="Collaborate"
              description="Discuss ideas, get feedback, and collaborate on your next big project."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to join the community?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sign up now and connect with thousands of developers worldwide.
          </p>
          <Button asChild size="lg" className="rounded-full">
            <Link to="/signup">Create Your Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="rounded-md bg-accent p-1">
                <code className="text-accent-foreground text-sm font-bold">&lt;/&gt;</code>
              </div>
              <span className="font-bold">CodeConnects</span>
            </div>
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} CodeConnects. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) => {
  return (
    <div className="glass p-6 rounded-xl animate-scale-in">
      <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center mb-4">
        {React.cloneElement(icon as React.ReactElement, { className: 'h-6 w-6 text-accent' })}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default Index;
