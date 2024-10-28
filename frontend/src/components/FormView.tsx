import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const FormView: React.FC = () => {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Player Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Enter your name" />
          </div>
          <div>
            <Label htmlFor="handicap">Handicap</Label>
            <Input
              id="handicap"
              type="number"
              placeholder="Enter your handicap"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Enter your email" />
          </div>
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Submit
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FormView;
