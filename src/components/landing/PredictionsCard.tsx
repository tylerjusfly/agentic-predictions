import React from 'react'
import PremierLeague from './TABLES/PremierLeague'
import ChampionsLeague from './TABLES/ChampionsLeague'

const PredictionsCard = ({country}: {country: string}) => {

  return (
    <div className='mt-8'>
      {
        country === 'england' && <PremierLeague/>
      }
      {
        country === 'championsleague' && <ChampionsLeague/>
      }
        
    </div>
  )
}

export default PredictionsCard