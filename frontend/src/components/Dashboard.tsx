import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="md:col-span-1 space-y-2">
        {[...Array(18)].map((_, i) => (
          <div
            key={i}
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold"
          >
            {i + 1}
          </div>
        ))}
      </div>
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>Hole 9</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Par: 4 Index: 9</p>
          <p>Distance: 365m, 355m</p>
          <p>Plays as: 361m, 351m</p>
          <p>Elevation: -3.7m</p>
          <div className="mt-4 h-64 bg-green-200 rounded-lg relative">
            <div className="absolute top-1/4 left-1/2 w-4 h-4 bg-green-600 rounded-full"></div>
            <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-black rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
