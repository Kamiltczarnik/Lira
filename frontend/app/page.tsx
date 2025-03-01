import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, PieChart, Mic, MessageSquare } from "lucide-react"
import LoginForm from "@/components/login-form"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Lira</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Personal
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Business
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              About
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Support
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Banking with the power of voice
                </h1>
                <p className="text-muted-foreground md:text-xl">
                  Experience the future of banking with our AI-powered voice assistant that makes managing your finances
                  effortless.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="#login">Get Started</Link>
                  </Button>
                  <Button variant="outline" size="lg">
                    Learn More
                  </Button>
                </div>
              </div>
              <div className="mx-auto lg:ml-auto">
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  alt="Banking Dashboard"
                  width={600}
                  height={400}
                  className="rounded-lg object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Meet Your AI Banking Assistant</h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl">
                  Experience the future of banking with our advanced voice-powered AI assistant.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
              <Card className="bg-background">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center space-y-2 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Mic className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Voice Commands</h3>
                    <p className="text-muted-foreground">
                      Simply speak to your assistant to check balances, make transfers, and more.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-background">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center space-y-2 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Natural Conversations</h3>
                    <p className="text-muted-foreground">
                      Talk naturally with your assistant as if you were speaking to a human banker.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-background">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center space-y-2 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <PieChart className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Smart Insights</h3>
                    <p className="text-muted-foreground">
                      Get personalized financial advice and insights from your AI assistant.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="login" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Log in to your account</h2>
                <p className="text-muted-foreground">
                  Access your accounts, check balances, and manage your finances securely.
                </p>
              </div>
              <div className="mx-auto w-full max-w-md space-y-2 bg-background p-6 rounded-lg shadow-sm">
                <LoginForm />
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="container flex flex-col gap-4 py-10 md:flex-row md:gap-8">
          <div className="flex flex-col gap-2 md:gap-4 md:flex-1">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold">Lira</span>
            </div>
            <p className="text-sm text-muted-foreground">Secure, smart banking for everyone.</p>
          </div>
          <div className="grid grid-cols-2 gap-10 md:flex md:gap-8 md:flex-1 md:justify-end">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Products</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:underline">
                    Accounts
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:underline">
                    Cards
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:underline">
                    Loans
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:underline">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:underline">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:underline">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t py-6">
          <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Lira. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-xs text-muted-foreground hover:underline">
                Terms
              </Link>
              <Link href="#" className="text-xs text-muted-foreground hover:underline">
                Privacy
              </Link>
              <Link href="#" className="text-xs text-muted-foreground hover:underline">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

