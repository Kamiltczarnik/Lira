"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {CreditCard, User, Bell, LogOut, Home, BarChart4, Send, Clock } from "lucide-react"
import VoiceAssistant from "@/components/voice-assistant"

export default function Dashboard() {
  const [greeting, setGreeting] = useState("Good day")

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good morning")
    else if (hour < 18) setGreeting("Good afternoon")
    else setGreeting("Good evening")
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="My Logo" width={64} height={64}   style={{ width: '64px', height: '64px' }}  />
            <span className="text-xl font-bold">LIRA</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="/dashboard" className="text-sm font-medium hover:underline underline-offset-4">
              Dashboard
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Accounts
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Payments
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
              <span className="sr-only">Account</span>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Log out</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <div className="flex flex-col gap-8">
          {/* Welcome section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{greeting}, Joe</h1>
                <p className="text-muted-foreground">Your AI banking assistant is ready to help you.</p>
              </div>
            </div>
          </section>

          {/* Main content with AI assistant as the focus */}
          <div className="grid gap-8 md:grid-cols-[1fr_350px] lg:grid-cols-[1fr_400px]">
            {/* AI Voice Assistant - Main feature */}
            <div className="order-2 md:order-1">
              <VoiceAssistant />
            </div>

            {/* Account summary - Secondary feature */}
            <div className="order-1 md:order-2 space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Account Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <span>Checking</span>
                    </div>
                    <span className="font-medium">$5,231.89</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <div className="flex items-center gap-2">
                      <BarChart4 className="h-4 w-4 text-muted-foreground" />
                      <span>Savings</span>
                    </div>
                    <span className="font-medium">$12,000.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span>Credit Card</span>
                    </div>
                    <span className="font-medium">$7,000.00 available</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="justify-start" size="sm">
                      <Send className="mr-2 h-4 w-4" />
                      Transfer
                    </Button>
                    <Button variant="outline" className="justify-start" size="sm">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay Bill
                    </Button>
                    <Button variant="outline" className="justify-start" size="sm">
                      <Clock className="mr-2 h-4 w-4" />
                      History
                    </Button>
                    <Button variant="outline" className="justify-start" size="sm">
                      <BarChart4 className="mr-2 h-4 w-4" />
                      Insights
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Try asking your assistant:</p>
                <ul className="space-y-1 list-disc pl-5">
                  <li>"What's my checking account balance?"</li>
                  <li>"Show me my recent transactions"</li>
                  <li>"Transfer $100 to my savings account"</li>
                  <li>"When is my credit card payment due?"</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Additional banking information in tabs - Less prominent */}
          <Tabs defaultValue="transactions" className="mt-6">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming Payments</TabsTrigger>
            </TabsList>
            <TabsContent value="transactions" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <CreditCard className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Amazon.com</p>
                      <p className="text-xs text-muted-foreground">Mar 1, 2025</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium">-$34.52</div>
                </div>
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Home className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Rent Payment</p>
                      <p className="text-xs text-muted-foreground">Feb 28, 2025</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium">-$1,200.00</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-green-500/10 p-2">
                      <Send className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Salary Deposit</p>
                      <p className="text-xs text-muted-foreground">Feb 25, 2025</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-green-500">+$3,500.00</div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="upcoming" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Home className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Rent Payment</p>
                      <p className="text-xs text-muted-foreground">Due Mar 31, 2025</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium">$1,200.00</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <CreditCard className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Credit Card Payment</p>
                      <p className="text-xs text-muted-foreground">Due Mar 15, 2025</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium">$350.00</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

