import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: "blue" | "green" | "purple" | "orange";
  loading?: boolean;
  suffix?: string;
}

const colorClasses = {
  blue: {
    bg: "from-blue-500 to-blue-600",
    icon: "text-blue-600",
    border: "border-blue-200"
  },
  green: {
    bg: "from-green-500 to-green-600",
    icon: "text-green-600",
    border: "border-green-200"
  },
  purple: {
    bg: "from-purple-500 to-purple-600",
    icon: "text-purple-600",
    border: "border-purple-200"
  },
  orange: {
    bg: "from-orange-500 to-orange-600",
    icon: "text-orange-600",
    border: "border-orange-200"
  }
};

export default function StatsCard({ title, value, icon: Icon, color, loading, suffix = "" }: StatsCardProps) {
  const colors = colorClasses[color];

  if (loading) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-300 rounded w-20"></div>
            <div className="h-8 w-8 bg-gray-300 rounded-lg"></div>
          </div>
          <div className="h-8 bg-gray-300 rounded w-16"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/70 backdrop-blur-sm rounded-2xl p-6 border ${colors.border} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`p-2 rounded-lg bg-gradient-to-r ${colors.bg}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="flex items-baseline">
        <span className="text-3xl font-bold text-gray-800">{value}</span>
        {suffix && <span className="text-lg text-gray-600 ml-1">{suffix}</span>}
      </div>
    </div>
  );
}
