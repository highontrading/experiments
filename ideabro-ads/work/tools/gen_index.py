import os,re
names={'A01':'ShootIsOptional','A02':'OnePhotoCampaign','A03':'MidnightToMorning','A04':'PressGenerate','A05':'RealOrAI','A06':'Receipt','A07':'HI-D2CFounders','A08':'HI-Diwali','A09':'HI-Freelancers','A10':'HI-Students','A11':'HI-ClientChat','A12':'Tracklist','A13':'MadeWithWhatYouLearn','A14':'FourRules','A15':'LuxuryEditorial','A16':'StudentsSay','A17':'LaunchPrice','A18':'POVDirector','A19':'NoiseVsDirection','A20':'WhoItsFor'}
have=sorted(f[:-4] for f in os.listdir('src/ads') if re.match(r'A\d\d\.tsx$',f))
lines=["import React from 'react';"]+[f"import * as {a} from './{a}';" for a in have]
lines.append("export const ADS: {id: string; dur: number; C: React.FC}[] = [")
lines+= [f"  {{id: '{a}-{names[a]}', dur: {a}.dur, C: {a}.{a}}}," for a in have]
lines.append("];")
open('src/ads/index.ts','w').write('\n'.join(lines)+'\n'); print(have)
