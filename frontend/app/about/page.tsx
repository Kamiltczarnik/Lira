import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PieChart, Mic, MessageSquare } from "lucide-react"
import LoginForm from "@/components/login-form"

export default function About() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="My Logo" width={64} height={64} style={{ width: '64px', height: '64px' }} />
            <span className="text-xl font-bold">Lira</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium hover:underline underline-offset-4">
              Home
            </Link>
            <Link href="/about" className="text-sm font-medium hover:underline underline-offset-4">
              About
            </Link>
            <Link href="/support" className="text-sm font-medium hover:underline underline-offset-4">
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
                  About Lira
                </h1>
                <p className="text-muted-foreground md:text-xl">
                  Our company was founded in March of 2025 by Kamil, Albert , Joseph and Joe. We are focused on providing banking services easily accesible to everyone. 
                </p>
              </div>
              <div className="mx-auto lg:ml-auto">
                <Image
                  src="/about-image.png"
                  alt="About Lira"
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
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Our Mission</h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl">
                  Our goal is to provide secure, efficient, and accessible banking experiences through voice-powered AI.
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
                      Control your finances with just your voice.
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
                      Engage in meaningful conversations with your assistant, just like you would with a human.
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
                      Get personalized advice to manage your finances better.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container flex flex-col gap-4 py-10 md:flex-row md:gap-8">
          <div className="flex flex-col gap-2 md:gap-4 md:flex-1">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="My Logo" width={64} height={64} style={{ width: '64px', height: '64px' }} />
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
                  <Link href="/about" className="text-muted-foreground hover:underline">
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
