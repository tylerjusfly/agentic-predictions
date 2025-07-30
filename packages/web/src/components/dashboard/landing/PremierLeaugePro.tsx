import { TabletIcon } from 'lucide-react'
import React from 'react'
import MatchCard from './MatchCard'
import { IPrediction } from '@/src/api/predictions';

const PremierLeaugePro = ({games}: {games: IPrediction[];}) => {
  return (
    <div className="bg-[#0f111b] rounded-md">
      <div className="flex justify-between items-center px-2 py-4 border-b border-[#2a2550]">
          <div className="flex items-center">
            <TabletIcon color="white" className='mr-2' />
            <span className="text-sm font-medium text-nowrap text-white">{"England Premier League"}</span>
          </div>
        </div>
        {
          games.map(data => (
            <MatchCard data={data} key={data.id} />
          ))
        }
      </div>
  )
}

export default PremierLeaugePro