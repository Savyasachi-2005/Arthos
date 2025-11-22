/**
 * Home Page - Entry point for Arthos platform
 * Displays UPI Spend Overview and Subscription Burn-Rate Preview
 */
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTransactions } from "../hooks/useTransactions";
import { useSubscriptions } from "../hooks/useSubscriptions";
import { useSubscriptionSummary } from "../hooks/useSubscriptionSummary";
import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import {
  TrendingUp,
  CreditCard,
  DollarSign,
  Activity,
  ArrowRight,
  Zap,
  BarChart3,
  Calendar,
  PieChart,
  Bell,
  Sparkles,
} from "lucide-react";
import { formatCurrency, formatDate } from "../utils/format";

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useTransactions({ limit: 10 });
  const { data: subscriptionsData, isLoading: subsLoading } = useSubscriptions({
    limit: 4,
  });
  const { data: summary } = useSubscriptionSummary();

  // Calculate subscription burn rate from real API
  const monthlyBurnRate = summary?.monthly_burn || 0;
  const upcomingRenewals = summary?.upcoming_renewals?.length || 0;

  // Calculate category distribution for mini preview
  const topCategories = data?.summary?.categories
    ? Object.entries(data.summary.categories)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 animate-pulse">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-sm font-medium">
                Your Financial Command Center
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              <span style={{ fontFamily: '"Faculty Glyphic", sans-serif' }}>
                Welcome to
              </span>{" "}
              <span
                className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400 text-5xl sm:text-6xl lg:text-7xl"
                style={{ fontFamily: '"Rubik Glitch", sans-serif' }}
              >
                Arthos
              </span>
            </h1>
            <p
              className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto mb-10"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              Analyze your spending, track subscriptions, and take control of
              your financial future — all in one place.
            </p>
            {upcomingRenewals > 0 && (
              <div className="mb-6 inline-flex items-center space-x-2 bg-yellow-400/20 backdrop-blur-sm rounded-full px-4 py-2 border border-yellow-300/30">
                <Bell className="h-4 w-4 text-yellow-200 animate-bounce" />
                <span className="text-sm font-medium">
                  {upcomingRenewals} subscription
                  {upcomingRenewals > 1 ? "s" : ""} renewing soon
                </span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => navigate("/analyzer")}
                className="!bg-white !text-blue-700 hover:!bg-blue-50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <TrendingUp className="h-5 w-5 mr-2" />
                Analyze UPI Messages
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/bank-analyzer")}
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm"
              >
                🏦 Bank Statement Analyzer
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/subscriptions")}
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Manage Subscriptions
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm"
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                View Dashboard
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 to-transparent" />
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-8">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Spend Card */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl shadow-blue-200/50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <DollarSign className="h-6 w-6" />
                </div>
                <Activity className="h-5 w-5 text-blue-200" />
              </div>
              <p className="text-sm font-medium text-blue-100 mb-1">
                Total Spend
              </p>
              <p className="text-3xl font-bold">
                {isLoading
                  ? "..."
                  : formatCurrency(data?.summary?.total_spend || 0)}
              </p>
              <p className="text-xs text-blue-200 mt-2">
                From UPI transactions
              </p>
            </div>
          </Card>

          {/* Transaction Count Card */}
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl shadow-green-200/50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <CreditCard className="h-6 w-6" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-200" />
              </div>
              <p className="text-sm font-medium text-green-100 mb-1">
                Transactions
              </p>
              <p className="text-3xl font-bold">
                {isLoading ? "..." : data?.summary?.transaction_count || 0}
              </p>
              <p className="text-xs text-green-200 mt-2">Analyzed this month</p>
            </div>
          </Card>

          {/* Monthly Burn Rate Card */}
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl shadow-purple-200/50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Calendar className="h-6 w-6" />
                </div>
                <Zap className="h-5 w-5 text-purple-200" />
              </div>
              <p className="text-sm font-medium text-purple-100 mb-1">
                Monthly Burn
              </p>
              <p className="text-3xl font-bold">
                {formatCurrency(monthlyBurnRate)}
              </p>
              <p className="text-xs text-purple-200 mt-2">From subscriptions</p>
            </div>
          </Card>

          {/* Top Category Card */}
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl shadow-orange-200/50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <PieChart className="h-6 w-6" />
                </div>
                <BarChart3 className="h-5 w-5 text-orange-200" />
              </div>
              <p className="text-sm font-medium text-orange-100 mb-1">
                Top Category
              </p>
              <p className="text-2xl font-bold truncate">
                {isLoading ? "..." : data?.summary?.top_category || "N/A"}
              </p>
              <p className="text-xs text-orange-200 mt-2">Highest spending</p>
            </div>
          </Card>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* UPI Spend Category Preview */}
          <Card className="shadow-xl shadow-gray-200/50 border-0 hover:shadow-2xl transition-shadow duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <CardHeader
                  title="Spending by Category"
                  subtitle="Top categories this month"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Activity className="h-8 w-8 text-blue-500 animate-pulse" />
                </div>
              ) : isError || !data?.summary?.categories ? (
                <div className="text-center py-12 text-gray-400">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No spending data available</p>
                  <Button
                    size="sm"
                    onClick={() => navigate("/analyzer")}
                    className="mt-4"
                  >
                    Analyze Transactions
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {topCategories.map(([category, amount]) => {
                    const percentage = (
                      (amount / data.summary.total_spend) *
                      100
                    ).toFixed(1);
                    const colors: Record<string, string> = {
                      Food: "bg-red-500",
                      Travel: "bg-blue-500",
                      Shopping: "bg-purple-500",
                      Bills: "bg-green-500",
                      Entertainment: "bg-yellow-500",
                      Groceries: "bg-teal-500",
                      Health: "bg-pink-500",
                      Education: "bg-indigo-500",
                    };
                    const barColor = colors[category] || "bg-gray-500";

                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-700">
                            {category}
                          </span>
                          <span className="text-gray-600">
                            {formatCurrency(amount)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-full ${barColor} rounded-full transition-all duration-500 ease-out`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          {percentage}% of total spend
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>

          {/* Subscription Burn Rate Preview */}
          <Card className="shadow-xl shadow-gray-200/50 border-0 hover:shadow-2xl transition-shadow duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <CardHeader
                    title="Active Subscriptions"
                    subtitle={
                      subsLoading
                        ? "Loading..."
                        : `${formatCurrency(monthlyBurnRate)}/month burn rate`
                    }
                  />
                  {upcomingRenewals > 0 && (
                    <div className="mt-2 inline-flex items-center space-x-2 bg-yellow-50 rounded-full px-3 py-1 border border-yellow-200">
                      <Bell className="h-3 w-3 text-yellow-600" />
                      <span className="text-xs font-medium text-yellow-700">
                        {upcomingRenewals} renewal
                        {upcomingRenewals > 1 ? "s" : ""} coming soon
                      </span>
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/subscriptions")}
                  className="text-purple-600 border-purple-200 hover:bg-purple-50"
                >
                  Manage
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              {subsLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Activity className="h-8 w-8 text-purple-500 animate-pulse" />
                </div>
              ) : !subscriptionsData?.items ||
                subscriptionsData.items.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm mb-2">No subscriptions tracked yet</p>
                  <Button
                    size="sm"
                    onClick={() => navigate("/subscriptions")}
                    className="mt-4"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Add Your First Subscription
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {subscriptionsData.items.map((sub) => {
                    // Generate color based on subscription name
                    const colors: Record<string, string> = {
                      netflix: "#E50914",
                      spotify: "#1DB954",
                      youtube: "#FF0000",
                      amazon: "#FF9900",
                      prime: "#00A8E1",
                      disney: "#113CCF",
                      apple: "#000000",
                      notion: "#000000",
                      figma: "#F24E1E",
                      adobe: "#FF0000",
                    };
                    const matchedColor = Object.entries(colors).find(([key]) =>
                      sub.name.toLowerCase().includes(key)
                    )?.[1];
                    const subColor = matchedColor || "#6366F1";

                    // Generate icon based on subscription name
                    const icons: Record<string, string> = {
                      netflix: "🎬",
                      spotify: "🎵",
                      youtube: "▶️",
                      amazon: "📦",
                      prime: "📦",
                      disney: "🏰",
                      apple: "🍎",
                      notion: "📝",
                      figma: "🎨",
                      adobe: "📸",
                    };
                    const matchedIcon = Object.entries(icons).find(([key]) =>
                      sub.name.toLowerCase().includes(key)
                    )?.[1];
                    const subIcon = matchedIcon || "📱";

                    return (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer group"
                        onClick={() => navigate("/subscriptions")}
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform duration-200"
                            style={{ backgroundColor: `${subColor}15` }}
                          >
                            {subIcon}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {sub.name}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                              {sub.billing_cycle} • Renews{" "}
                              {formatDate(sub.renewal_date)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-800">
                            {formatCurrency(sub.monthly_equivalent)}
                          </p>
                          <p className="text-xs text-gray-500">/month</p>
                        </div>
                      </div>
                    );
                  })}

                  {/* Show upcoming renewals */}
                  {summary?.upcoming_renewals &&
                    summary.upcoming_renewals.length > 0 && (
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <div className="flex items-start space-x-3">
                          <Bell className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-yellow-800 mb-2">
                              Upcoming Renewals
                            </p>
                            <div className="space-y-1">
                              {summary.upcoming_renewals
                                .slice(0, 2)
                                .map((renewal, idx) => (
                                  <p
                                    key={idx}
                                    className="text-xs text-yellow-700"
                                  >
                                    •{" "}
                                    <span className="font-medium">
                                      {renewal.name}
                                    </span>{" "}
                                    in {renewal.days_left} day
                                    {renewal.days_left !== 1 ? "s" : ""}
                                  </p>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Total Burn Rate */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Zap className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <span className="font-semibold text-gray-800 block">
                            Total Monthly Burn
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatCurrency(summary?.yearly_burn || 0)}/year
                          </span>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-purple-600">
                        {formatCurrency(monthlyBurnRate)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-2xl shadow-blue-300/50 border-0 overflow-hidden">
          <div className="relative p-8 sm:p-12">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

            <div className="relative text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">Get Started Today</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Master Your Finances?
              </h2>
              <p className="text-lg text-blue-100 mb-8">
                Start by analyzing your UPI transaction messages and discover
                where your money goes.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate("/analyzer")}
                  className="!bg-white !text-blue-700 hover:!bg-blue-50 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Analyze Your Spending
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/subscriptions")}
                  className="bg-transparent border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Track Subscriptions
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="bg-transparent border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm"
                >
                  <BarChart3 className="h-5 w-5 mr-2" />
                  View Full Dashboard
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};
