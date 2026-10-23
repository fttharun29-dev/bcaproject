import { DemoScene } from '../types/detection';

import techDeskImg from '../assets/images/demo_tech_desk_1792776796109.jpg';
import urbanStreetImg from '../assets/images/demo_urban_street_1792776797209.jpg';
import livingRoomImg from '../assets/images/demo_living_room_1792776796567.jpg';

export const DEMO_SCENES: DemoScene[] = [
  {
    id: 'tech-desk',
    name: 'Tech Workspace',
    description: 'Laptop, smartphone, coffee mug, computer mouse, notebook',
    type: 'image',
    url: techDeskImg,
  },
  {
    id: 'urban-street',
    name: 'City Street & Traffic',
    description: 'Pedestrians, red commuter bicycle, cars, London bus, backpacks',
    type: 'image',
    url: urbanStreetImg,
  },
  {
    id: 'living-room',
    name: 'Home Living Room',
    description: 'Golden retriever dog, sofa couch, water bottle, coffee cup, potted plant',
    type: 'image',
    url: livingRoomImg,
  },
];
