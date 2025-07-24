import React from 'react'
import PremierLeague from '../fixturetable/PremierLeague'
import ChampionsLeague from '../fixturetable/ChampionsLeague'

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