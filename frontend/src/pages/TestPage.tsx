import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-lg">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">OLX Clone Test Page</h1>
          <p className="text-gray-600">Testing if Tailwind CSS is working properly</p>
        </div>

        {/* Button Tests */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Button Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <Button className="bg-blue-600 hover:bg-blue-700">Primary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button className="bg-gradient-to-r from-yellow-400 to-blue-500 text-white">Gradient Button</Button>
            </div>
          </CardContent>
        </Card>

        {/* Color Tests */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Color & Layout Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-500 text-white p-4 rounded-lg">Red Box</div>
              <div className="bg-green-500 text-white p-4 rounded-lg">Green Box</div>
              <div className="bg-blue-500 text-white p-4 rounded-lg">Blue Box</div>
            </div>
          </CardContent>
        </Card>

        {/* Typography Tests */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Typography Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">Heading 1</h1>
            <h2 className="text-3xl font-bold text-gray-800">Heading 2</h2>
            <h3 className="text-2xl font-bold text-gray-700">Heading 3</h3>
            <p className="text-lg text-gray-600">Regular paragraph text</p>
            <p className="text-sm text-gray-500">Small text</p>
          </CardContent>
        </Card>

        {/* OLX-style Component */}
        <Card className="border-2 border-orange-300">
          <CardHeader className="bg-gradient-to-r from-orange-400 to-yellow-400 text-white">
            <CardTitle>OLX Style Card</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                OLX
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Sample Product</h3>
                <p className="text-gray-600">₹ 25,000</p>
                <p className="text-sm text-gray-500">Mumbai, Maharashtra</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
