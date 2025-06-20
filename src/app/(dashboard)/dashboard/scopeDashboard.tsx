'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import {Bar} from 'react-chartjs-2'

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend)

const options = {
  responsive: true,
  maintainAspectRatio: false, // ✅ 높이를 부모에 맞게 조정
  plugins: {
    legend: {position: 'top' as const},
    title: {display: true, text: 'Stacked Bar Chart'}
  },
  scales: {
    x: {stacked: true},
    y: {stacked: true}
  }
}

const data = {
  labels: ['1월', '2월', '3월', '4월'],
  datasets: [
    {
      label: 'A 제품',
      data: [100, 200, 150, 250],
      backgroundColor: 'rgba(255, 99, 132, 0.5)'
    },
    {
      label: 'B 제품',
      data: [50, 100, 200, 100],
      backgroundColor: 'rgba(53, 162, 235, 0.5)'
    }
  ]
}

export default function ScopeDashboard() {
  return (
    <div className="h-[calc(100vh-80px)] w-full p-4 ">
      <div className="flex flex-col w-full h-full gap-4">
        <div className="flex flex-row h-[50%] w-full gap-4">
          {/* 협력사 리스트============================================================================== */}
          <Card className="w-[30%] bg-white rounded-lg p-4 flex flex-col">
            <CardHeader className="p-0">
              <CardTitle className="text-lg font-bold">협력사 리스트</CardTitle>
              <CardDescription>등록된 협력사</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 gap-2 p-2 overflow-y-auto border rounded-lg scroll-auto custom-scrollbar">
              <div className="border rounded-lg shadow-sm min-h-12" />
              <div className="border rounded-lg shadow-sm min-h-12" />
              <div className="border rounded-lg shadow-sm min-h-12" />
              <div className="border rounded-lg shadow-sm min-h-12" />
              <div className="border rounded-lg shadow-sm min-h-12" />
              <div className="border rounded-lg shadow-sm min-h-12" />
              <div className="border rounded-lg shadow-sm min-h-12" />
              <div className="border rounded-lg shadow-sm min-h-12" />
              <div className="border rounded-lg shadow-sm min-h-12" />
              <div className="border rounded-lg shadow-sm min-h-12" />
            </CardContent>
          </Card>
          {/* 탄소 배출량============================================================================== */}
          <Card className="w-[70%] bg-white rounded-lg p-4 flex flex-col">
            <CardHeader className="p-0">
              <CardTitle className="text-lg font-bold">총 탄소 배출량</CardTitle>
              <CardDescription>협력사/지사 명</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-2 border rounded-lg">
              <div className="w-full h-full">
                <Bar options={options} data={data} />
              </div>
            </CardContent>
          </Card>
        </div>
        {/* 배출량 데이터============================================================================== */}
        <Card className="flex flex-col flex-1 p-4 bg-white rounded-lg">
          <CardHeader className="p-0">
            <CardTitle className="text-lg font-bold">탄소 배출량 데이터</CardTitle>
            <CardDescription>협력사/자사 명</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-2 overflow-y-auto border rounded-lg scroll-auto custom-scrollbar">
            <div className="flex-1 max-h-0">
              <table className="min-w-full text-sm border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-center border">#</th>
                    <th className="px-4 py-2 text-center border">연도</th>
                    <th className="px-4 py-2 text-center border">일련번호</th>
                    <th className="px-4 py-2 text-center border">내부시설명</th>
                    <th className="px-4 py-2 text-center border">배출활동</th>
                    <th className="px-4 py-2 text-center border">활동자료</th>
                    <th className="px-4 py-2 text-center border">단위</th>
                    <th className="px-4 py-2 text-center border">수치</th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(20)].map((_, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border">{index + 1}</td>
                      <td className="px-4 py-2 border">2025</td>
                      <td className="px-4 py-2 border">ID-{index + 1}</td>
                      <td className="px-4 py-2 border">제1공장</td>
                      <td className="px-4 py-2 border">연료 연소</td>
                      <td className="px-4 py-2 border">가스 사용량</td>
                      <td className="px-4 py-2 border">kgCO2eq</td>
                      <td className="px-4 py-2 border">123.45</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
