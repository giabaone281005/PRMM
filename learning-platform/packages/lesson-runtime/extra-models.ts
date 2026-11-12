export const extraModels=['percentage_grid','ratio_table','coordinate_plane','rectangle_area','pythagorean','linear_graph'] as const;
export type ExtraModel=typeof extraModels[number];
export const extraEngineMap={percentage_grid:'percentage_2d',ratio_table:'ratio_2d',coordinate_plane:'coordinate_2d',rectangle_area:'area_2d',pythagorean:'pythagorean_2d',linear_graph:'linear_plot_2d'} as const;
export function isExtraModel(model:string):model is ExtraModel{return (extraModels as readonly string[]).includes(model);}
export type ModelControl={name:string;label:string;min:number;max:number;step:number};
export function extraControls(model:ExtraModel):ModelControl[]{
  switch(model){case'percentage_grid':return[{name:'x',label:'Phần trăm',min:0,max:100,step:1}];case'ratio_table':return[{name:'x',label:'Số lần gấp',min:0,max:10,step:.1}];case'coordinate_plane':return['x','y'].map(name=>({name,label:name==='x'?'Ngang (x)':'Dọc (y)',min:-10,max:10,step:.1}));case'rectangle_area':case'pythagorean':return['width','height'].map(name=>({name,label:model==='pythagorean'?(name==='width'?'Cạnh góc vuông 1':'Cạnh góc vuông 2'):(name==='width'?'Chiều dài':'Chiều rộng'),min:1,max:10,step:.1}));case'linear_graph':return[{name:'a',label:'Độ dốc',min:-10,max:10,step:.1},{name:'b',label:'Độ cao ban đầu',min:-10,max:10,step:.1}];}
}
export const extraDefaults={y:0,width:1,height:1,targetY:0,targetWidth:3,targetHeight:4};
export function extraMetrics(model:ExtraModel,s:Record<string,number>){
  switch(model){case'percentage_grid':return{modelValue:s.b*s.x/100,modelError:Math.abs(s.x-s.targetX)};case'ratio_table':return{modelValue:s.b*s.x,modelError:Math.abs(s.x-s.targetX)};case'coordinate_plane':return{modelValue:Math.hypot(s.x,s.y),modelError:Math.hypot(s.x-s.targetX,s.y-s.targetY)};case'rectangle_area':return{modelValue:s.width*s.height,modelError:Math.abs(s.width-s.targetWidth)+Math.abs(s.height-s.targetHeight)};case'pythagorean':return{modelValue:Math.hypot(s.width,s.height),modelError:Math.abs(s.width-s.targetWidth)+Math.abs(s.height-s.targetHeight)};case'linear_graph':return{modelValue:s.a*s.x+s.b,modelError:Math.abs(s.a-s.targetA)+Math.abs(s.b-s.targetB)};}
}
