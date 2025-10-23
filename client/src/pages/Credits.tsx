import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Check, CreditCard, Loader2, QrCode, Wallet, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Credits() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const { data: credits } = trpc.credits.getBalance.useQuery();
  const { data: packages } = trpc.payments.getPackages.useQuery();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Buy Credits</h1>
          </div>
          <Button variant="outline" asChild size="sm">
            <Link href="/generate">Go to Generate</Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Current Balance */}
        <Card className="mb-8 bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
          <CardHeader>
            <CardTitle className="text-white">Your Balance</CardTitle>
            <CardDescription className="text-purple-100">
              Available credits for AI generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{credits?.balance || 0} Credits</div>
            <p className="text-sm text-purple-100 mt-2">
              ≈ ${((credits?.balance || 0) / 100).toFixed(2)} worth of generations
            </p>
          </CardContent>
        </Card>

        {/* Credit Packages */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Choose a Package</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages?.map((pkg) => (
              <Card
                key={pkg.id}
                className={pkg.popular ? "border-purple-500 border-2 relative" : ""}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500">
                    Most Popular
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle>{pkg.name}</CardTitle>
                  <CardDescription>{pkg.credits} credits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-3xl font-bold">{pkg.priceDisplay}</div>
                    <p className="text-sm text-muted-foreground">
                      ≈ ${(pkg.credits / 100).toFixed(2)} worth
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>~{Math.floor(pkg.credits / 3)} images</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>~{Math.floor(pkg.credits / 65)} videos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>30% markup included</span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    variant={pkg.popular ? "default" : "outline"}
                    onClick={() => {
                      toast.info("Payment integration coming soon!");
                    }}
                  >
                    Buy Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Accepted Payment Methods</CardTitle>
            <CardDescription>
              We support multiple Thai payment methods for your convenience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-500" />
                <div>
                  <div className="font-semibold">Credit/Debit Card</div>
                  <div className="text-xs text-muted-foreground">Visa, Mastercard</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <QrCode className="h-6 w-6 text-purple-500" />
                <div>
                  <div className="font-semibold">PromptPay</div>
                  <div className="text-xs text-muted-foreground">QR Code Payment</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <Wallet className="h-6 w-6 text-orange-500" />
                <div>
                  <div className="font-semibold">TrueMoney Wallet</div>
                  <div className="text-xs text-muted-foreground">E-Wallet</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

