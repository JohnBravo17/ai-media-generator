import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE, getLoginUrl } from "@/const";
import { ArrowRight, Image, Sparkles, Video, Zap, Shield, DollarSign } from "lucide-react";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Create Stunning AI Media in Seconds
            </h1>
            <p className="text-xl text-purple-100">
              Generate high-quality images and videos using Runware and Replicate APIs. 
              Pay with Thai payment methods. Fast, affordable, and powerful.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" variant="secondary" asChild className="text-lg">
                <a href="/generate">
                  Start Creating
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg bg-white/10 hover:bg-white/20 border-white/20">
                <a href="#features">Learn More</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Powerful AI Generation</h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to create amazing visual content
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Image className="h-12 w-12 text-purple-600 mb-2" />
                <CardTitle>Image Generation</CardTitle>
                <CardDescription>
                  Create stunning images from text prompts using FLUX, Stable Diffusion, and more
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    Text to image
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    Multiple models available
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    High resolution output
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Video className="h-12 w-12 text-blue-600 mb-2" />
                <CardTitle>Video Generation</CardTitle>
                <CardDescription>
                  Generate short videos from text descriptions using cutting-edge AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    Text to video
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    Multiple video models
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    HD quality output
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-12 w-12 text-yellow-600 mb-2" />
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>
                  Sub-second image generation with Runware's optimized infrastructure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    Instant results
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    No waiting in queues
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    Reliable uptime
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <DollarSign className="h-12 w-12 text-green-600 mb-2" />
                <CardTitle>Thai Payment Methods</CardTitle>
                <CardDescription>
                  Pay easily with credit cards, PromptPay, or TrueMoney Wallet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-green-500" />
                    Credit/Debit cards
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-green-500" />
                    PromptPay QR
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-green-500" />
                    TrueMoney Wallet
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-indigo-600 mb-2" />
                <CardTitle>Transparent Pricing</CardTitle>
                <CardDescription>
                  Pay only for what you use with clear, upfront pricing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-500" />
                    No hidden fees
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-500" />
                    Credit-based system
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-500" />
                    Flexible packages
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Sparkles className="h-12 w-12 text-pink-600 mb-2" />
                <CardTitle>Multiple Providers</CardTitle>
                <CardDescription>
                  Choose between Runware and Replicate for optimal results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-pink-500" />
                    Runware: Fast & cheap
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-pink-500" />
                    Replicate: High quality
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-pink-500" />
                    Best of both worlds
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-xl text-muted-foreground">
              Buy credits and use them for any generation. No subscriptions, no commitments.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 rounded-full p-2 text-purple-600 font-bold">1</div>
                  <div>
                    <h3 className="font-semibold">Buy Credits</h3>
                    <p className="text-sm text-muted-foreground">
                      Purchase credit packages using Thai payment methods
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 rounded-full p-2 text-purple-600 font-bold">2</div>
                  <div>
                    <h3 className="font-semibold">Generate Content</h3>
                    <p className="text-sm text-muted-foreground">
                      Use credits to generate images (~1-5 credits) or videos (~50-100 credits)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 rounded-full p-2 text-purple-600 font-bold">3</div>
                  <div>
                    <h3 className="font-semibold">Download & Use</h3>
                    <p className="text-sm text-muted-foreground">
                      Download your generated content and use it however you like
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Create?</h2>
          <p className="text-xl text-purple-100 mb-8">
            Start generating stunning AI media today
          </p>
          {isAuthenticated ? (
            <Button size="lg" variant="secondary" asChild className="text-lg">
              <a href="/generate">
                Go to Generator
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          ) : (
            <Button size="lg" variant="secondary" asChild className="text-lg">
              <a href={getLoginUrl()}>
                Sign Up Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">
            © 2025 {APP_TITLE}. Powered by Runware and Replicate APIs.
          </p>
        </div>
      </footer>
    </div>
  );
}

