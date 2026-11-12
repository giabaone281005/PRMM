import extra0 from '../../contracts/fixtures/percent-of-a-whole.lesson.json' with {type:'json'};
import extra1 from '../../contracts/fixtures/ratio-double-line.lesson.json' with {type:'json'};
import extra2 from '../../contracts/fixtures/coordinate-find-point.lesson.json' with {type:'json'};
import extra3 from '../../contracts/fixtures/rectangle-area-lab.lesson.json' with {type:'json'};
import extra4 from '../../contracts/fixtures/right-triangle-squares.lesson.json' with {type:'json'};
import extra5 from '../../contracts/fixtures/linear-graph-lab.lesson.json' with {type:'json'};
import triangle from '../../contracts/fixtures/grade7-triangle-angle-sum.lesson.json' with {type:'json'};
import solid from '../../contracts/fixtures/grade8-solid-volume.lesson.json' with {type:'json'};
import numberLine from '../../contracts/fixtures/integer-minus-three.lesson.json' with {type:'json'};
import fraction from '../../contracts/fixtures/fraction-three-fourths.lesson.json' with {type:'json'};
import balance from '../../contracts/fixtures/balance-linear-equation.lesson.json' with {type:'json'};
import graph from '../../contracts/fixtures/quadratic-transformations.lesson.json' with {type:'json'};
import {routeEngine,validateLesson,type Lesson} from '../lesson-contract';
export const fixtures=[triangle,solid,numberLine,fraction,balance,graph,extra0,extra1,extra2,extra3,extra4,extra5] as Lesson[];
export function createDraft(grade:number,objective:string,kind:'triangle'|'solid'):Lesson{
  if((kind==='triangle'&&grade!==7)||(kind==='solid'&&grade!==8))throw Error('Template hiện hỗ trợ tam giác lớp 7 và khối hộp lớp 8. Các chủ đề khác cần template đã kiểm chứng.');
  const l=structuredClone(fixtures[kind==='triangle'?0:1]);l.lessonId='lesson-'+crypto.randomUUID();l.title=objective.trim()||l.title;l.learningObjectives=[objective.trim()||l.learningObjectives[0]];
  if(!routeEngine(l.engine.requiredCapabilities).engine||validateLesson(l).length)throw Error('Template không tương thích');return l;
}
