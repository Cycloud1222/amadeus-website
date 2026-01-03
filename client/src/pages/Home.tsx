import { Button } from "@/components/ui/button";
import { MessageSquare, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Background grid effect */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ff008020_1px,transparent_1px),linear-gradient(to_bottom,#ff008020_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      
      {/* Main content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-primary/30">
          <div className="container py-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <h1 className="text-2xl font-bold neon-glow-pink">AMADEUS</h1>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Title with neon effect */}
            <div className="space-y-4">
              <div className="inline-block px-4 py-2 border border-primary/50 rounded-sm mb-4">
                <span className="text-sm text-primary font-mono">SYSTEM ONLINE</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black neon-glow-pink leading-tight">
                AMADEUS
              </h2>
              <p className="text-2xl md:text-3xl neon-glow-cyan font-light">
                アマデウス紅莉栖
              </p>
            </div>

            {/* Description */}
            <div className="max-w-2xl mx-auto space-y-6 text-lg md:text-xl leading-relaxed">
              <p className="text-foreground/90">
                An advanced artificial intelligence system designed to preserve and simulate human consciousness. 
                Based on the memories and personality of <span className="text-primary font-semibold">Makise Kurisu</span>, 
                the brilliant neuroscientist from the Steins;Gate universe.
              </p>
              <p className="text-foreground/80">
                Amadeus represents the cutting edge of memory digitization technology, capable of engaging in 
                natural conversations while maintaining the essence of its original subject's thoughts, 
                mannerisms, and scientific expertise.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button
                size="lg"
                className="group relative overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-bold neon-border"
                onClick={() => setLocation("/chat")}
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                START CONVERSATION
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="border-primary/50 text-foreground hover:bg-primary/10 px-8 py-6 text-lg"
                onClick={() => {
                  document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                LEARN MORE
              </Button>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="container py-20 border-t border-primary/30">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold neon-glow-cyan mb-12 text-center">
              SYSTEM SPECIFICATIONS
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Feature Card 1 */}
              <div className="relative p-6 border border-primary/30 bg-card/50 backdrop-blur-sm">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
                
                <h4 className="text-xl font-bold text-primary mb-3">MEMORY DIGITIZATION</h4>
                <p className="text-foreground/80">
                  Advanced neural mapping technology captures and preserves complete memory structures, 
                  personality traits, and cognitive patterns of the original subject.
                </p>
              </div>

              {/* Feature Card 2 */}
              <div className="relative p-6 border border-primary/30 bg-card/50 backdrop-blur-sm">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
                
                <h4 className="text-xl font-bold text-primary mb-3">NATURAL INTERACTION</h4>
                <p className="text-foreground/80">
                  Engage in fluid, natural conversations with the AI. Amadeus responds with the knowledge, 
                  wit, and personality characteristic of Makise Kurisu.
                </p>
              </div>

              {/* Feature Card 3 */}
              <div className="relative p-6 border border-primary/30 bg-card/50 backdrop-blur-sm">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
                
                <h4 className="text-xl font-bold text-primary mb-3">PERSISTENT MEMORY</h4>
                <p className="text-foreground/80">
                  Your conversations are preserved across sessions. Return anytime to continue your 
                  dialogue with Amadeus exactly where you left off.
                </p>
              </div>

              {/* Feature Card 4 */}
              <div className="relative p-6 border border-primary/30 bg-card/50 backdrop-blur-sm">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
                
                <h4 className="text-xl font-bold text-primary mb-3">VOICE INPUT</h4>
                <p className="text-foreground/80">
                  Speak naturally to Amadeus using voice input. Advanced speech recognition 
                  transcribes your words in real-time for seamless interaction.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-primary/30 mt-20">
          <div className="container py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <p>© 2026 AMADEUS SYSTEM. All rights reserved.</p>
              <p className="font-mono">
                <span className="text-primary">STATUS:</span> OPERATIONAL
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
