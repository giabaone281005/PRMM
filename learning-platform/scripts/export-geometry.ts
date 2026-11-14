import {writeFileSync} from 'node:fs';
import {geometryTemplates} from '../packages/lesson-authoring/geometry-templates';
import {compileProblem} from '../packages/lesson-authoring/authoring-service';
import {LessonSession} from '../packages/lesson-runtime';
import {geometryModel,geometrySolutionEvents,geometryTargetIndex,geometrySelectable,type GeometryConfig} from '../packages/lesson-runtime/geometry';
const fixtures=geometryTemplates.flatMap(t=>[0,1,2].map(i=>{
 const input=structuredClone(t.example),sets=[input.parameters,input.variants.practice,input.variants.assessment];input.parameters=sets[i];input.variants={practice:sets[(i+1)%3],assessment:sets[(i+2)%3]};input.title+=` · Bộ ${i+1}`;
 const {manifest,receipt}=compileProblem(input,{lessonId:`eng02-geo-${t.curriculumCode.slice(-2)}-${i+1}`,version:1}),session=new LessonSession(manifest);
 const steps=manifest.recognition!.map(task=>{
  const g=task.uime!.geometry!,events:any[]=[];
  const change=(event:any)=>{const accepted=session.interact(event);events.push({event,accepted,success:session.success,state:structuredClone(session.snapshot.state)});};
  if(session.success)throw Error('Auto-complete');
  change({type:'adjust_parameter',name:'x',value:10000});change({type:'adjust_parameter',name:'width',value:1});
  if(session.success)throw Error('Empty confirmation completes step');
  for(const event of geometrySolutionEvents(g))change(event);
  if(!session.success||!session.advance())throw Error(`Unreachable ${g.mode}/${g.task}`);return events;
 });
 return {input,manifest,receipt,steps};
}));
writeFileSync('contracts/generated/geometry.json',JSON.stringify(fixtures,null,2)+'\n');
const vector=(name:string,g:GeometryConfig)=>{const m=geometryModel(g);return {name,config:g,valid:true,value:m.value,facts:m.facts,targetIndex:geometryTargetIndex(g),selectionCount:geometrySelectable(g).length};};
const vectors:any[]=fixtures.map(f=>vector(f.manifest.lessonId,f.manifest.recognition![0].uime!.geometry!));
const pair=fixtures.find(f=>f.input.mode==='two_circles')!.manifest.recognition![0].uime!.geometry!;
for(const [name,data] of Object.entries({concentric:{radius:3,radius2:2,distance:0},coincident:{radius:3,radius2:3,distance:0},contained:{radius:5,radius2:1,distance:2},internalTangent:{radius:5,radius2:2,distance:3}}))vectors.push(vector(name,{...pair,data:{...data,unit:'cm'}}));
const invalid=[
 {mode:'right_triangle',data:{legA:0}},
 {mode:'right_triangle',data:{legA:.5,legB:20}},
 {mode:'triangle_circles',data:{sideA:1,sideB:2,sideC:3}},
 {mode:'triangle_circles',data:{sideA:1,sideB:1,sideC:1.9999}},
 {mode:'circle_symmetry',data:{axis:'diagonal'}},
 {mode:'line_circle',data:{distance:-1}},
 {mode:'two_circles',data:{radius2:0}},
 {mode:'circle_angles',data:{sweep:180}},
 {mode:'arc_sector_annulus',data:{innerRadius:10}},
 {mode:'cyclic_polygon',data:{angleB:170,angleC:80}},
 {mode:'cyclic_polygon',data:{vertices:2}},
];
for(const [i,entry] of invalid.entries()){const base=fixtures.find(f=>f.input.mode===entry.mode)!.manifest.recognition![0].uime!.geometry!;vectors.push({name:`invalid-${i}`,valid:false,config:{...base,data:{...base.data,...entry.data}}});}
vectors.push({name:'wrong-curriculum',valid:false,config:{...pair,curriculumCode:'M9-GEO-01'}});
writeFileSync('contracts/core-engines/geometry-vectors.json',JSON.stringify(vectors,null,2)+'\n');
console.log(`Exported ${fixtures.length} full lessons and ${vectors.length} math/validation vectors. No database writes.`);
