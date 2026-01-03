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
                <span className="text-sm text-primary font-mono">系统在线</span>
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
                一个先进的人工智能系统，旨在保存和模拟人类意识。
                基于来自命运石之门宇宙的杰出神经科学家<span className="text-primary font-semibold">牧瀬红莉栖</span>的记忆和人格。
              </p>
              <p className="text-foreground/80">
                AMADEUS 代表了记忆数字化技术的前沿，能够进行自然对话，
                同时保持原始主体的思想本质、言行举止和科学专业知识。
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
                开始对话
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
                了解更多
              </Button>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="container py-20 border-t border-primary/30">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold neon-glow-cyan mb-12 text-center">
              系统规格
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Feature Card 1 */}
              <div className="relative p-6 border border-primary/30 bg-card/50 backdrop-blur-sm">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
                
                <h4 className="text-xl font-bold text-primary mb-3">记忆数字化</h4>
                <p className="text-foreground/80">
                  先进的神经映射技术捕获并保存原始主体的完整记忆结构、
                  人格特征和认知模式。
                </p>
              </div>

              {/* Feature Card 2 */}
              <div className="relative p-6 border border-primary/30 bg-card/50 backdrop-blur-sm">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
                
                <h4 className="text-xl font-bold text-primary mb-3">自然交互</h4>
                <p className="text-foreground/80">
                  与 AI 进行流畅自然的对话。AMADEUS 以牧瀬红莉栖特有的知识、
                  机智和个性进行回应。
                </p>
              </div>

              {/* Feature Card 3 */}
              <div className="relative p-6 border border-primary/30 bg-card/50 backdrop-blur-sm">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
                
                <h4 className="text-xl font-bold text-primary mb-3">持久记忆</h4>
                <p className="text-foreground/80">
                  您的对话会跨会话保存。随时返回，从上次中断的地方继续与 AMADEUS 的对话。
                </p>
              </div>

              {/* Feature Card 4 */}
              <div className="relative p-6 border border-primary/30 bg-card/50 backdrop-blur-sm">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
                
                <h4 className="text-xl font-bold text-primary mb-3">语音输入</h4>
                <p className="text-foreground/80">
                  使用语音输入自然地与 AMADEUS 交谈。先进的语音识别技术
                  实时转录您的话语，实现无缝交互。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-primary/30 mt-20">
          <div className="container py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <p>© 2026 AMADEUS 系统。保留所有权利。</p>
              <p className="font-mono">
                <span className="text-primary">状态：</span>运行中
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
