export const obj=properties=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
const length={type:'number',minimum:.5,maximum:20},angle={type:'number',minimum:0,maximum:359},unit={enum:['cm','m']},en=(...values)=>({enum:values});
export const geometryDataSchemas={
 right_triangle:obj({legA:length,legB:length,angleAt:en('B','C'),target:en('opposite','adjacent','hypotenuse'),ratio:en('sin','cos','tan'),unit}),
 circle_symmetry:obj({radius:length,pointDistance:{type:'number',minimum:.5,maximum:30},pointAngle:{type:'number',minimum:10,maximum:80},axis:en('x','y'),unit}),
 line_circle:obj({radius:length,distance:{type:'number',minimum:0,maximum:40},normalAngle:angle,unit}),
 two_circles:obj({radius:length,radius2:length,distance:{type:'number',minimum:0,maximum:40},unit}),
 circle_angles:obj({radius:length,sweep:{type:'number',minimum:20,maximum:160},unit}),
 arc_sector_annulus:obj({radius:length,innerRadius:length,sweep:{type:'number',minimum:20,maximum:160},measure:en('arc','sector','annulus'),unit}),
 triangle_circles:obj({sideA:length,sideB:length,sideC:length,construction:en('incircle','circumcircle'),unit}),
 cyclic_polygon:obj({radius:length,shape:en('regular_polygon','cyclic_quadrilateral'),vertices:{type:'integer',minimum:3,maximum:12},angleB:angle,angleC:angle,angleD:angle,unit}),
};
const triangle=(legA,legB,angleAt,target,ratio)=>({legA,legB,angleAt,target,ratio,unit:'cm'});
const modeSamples={
 right_triangle:[triangle(3,4,'B','opposite','sin'),triangle(5,5,'C','adjacent','cos'),triangle(3,3*Math.sqrt(3),'B','hypotenuse','tan')],
 circle_symmetry:[{radius:4,pointDistance:2,pointAngle:35,axis:'x',unit:'cm'},{radius:3,pointDistance:3,pointAngle:60,axis:'y',unit:'cm'},{radius:2,pointDistance:4,pointAngle:45,axis:'x',unit:'cm'}],
 line_circle:[{radius:4,distance:2,normalAngle:20,unit:'cm'},{radius:3,distance:3,normalAngle:70,unit:'cm'},{radius:2,distance:4,normalAngle:120,unit:'cm'}],
 two_circles:[{radius:4,radius2:3,distance:5,unit:'cm'},{radius:3,radius2:2,distance:5,unit:'cm'},{radius:2,radius2:1,distance:5,unit:'cm'}],
 circle_angles:[{radius:4,sweep:60,unit:'cm'},{radius:3,sweep:90,unit:'cm'},{radius:5,sweep:120,unit:'cm'}],
 arc_sector_annulus:[{radius:4,innerRadius:2,sweep:60,measure:'arc',unit:'cm'},{radius:3,innerRadius:1,sweep:90,measure:'sector',unit:'cm'},{radius:5,innerRadius:3,sweep:120,measure:'annulus',unit:'cm'}],
 triangle_circles:[{sideA:5,sideB:4,sideC:3,construction:'incircle',unit:'cm'},{sideA:5,sideB:5,sideC:6,construction:'circumcircle',unit:'cm'},{sideA:6,sideB:6,sideC:6,construction:'incircle',unit:'cm'}],
 cyclic_polygon:[{radius:4,shape:'cyclic_quadrilateral',vertices:4,angleB:70,angleC:170,angleD:270,unit:'cm'},{radius:3,shape:'regular_polygon',vertices:6,angleB:80,angleC:180,angleD:260,unit:'cm'},{radius:5,shape:'regular_polygon',vertices:3,angleB:90,angleC:190,angleD:280,unit:'cm'}],
};
const names=['Cạnh đối, kề, huyền','Tỉ số lượng giác','Góc nhọn và góc đặc biệt','Đường tròn và đối xứng','Đường thẳng và đường tròn','Vị trí hai đường tròn','Góc ở tâm và góc nội tiếp','Cung, quạt tròn và vành khuyên','Nội tiếp và ngoại tiếp tam giác','Tứ giác nội tiếp và đa giác đều'];
export const geometryCatalog=names.map((label,i)=>{
 const index=i+1,mode=Object.keys(geometryDataSchemas)[index<=3?0:index-3],templateId='math9-geometry-'+String(index).padStart(2,'0'),curriculumCode='M9-GEO-'+String(index).padStart(2,'0'),samples=modeSamples[mode];
 const example={authoringVersion:'1.0.0',namespace:'excel-repo-v1',templateVersion:1,templateId,curriculumCode,mode,title:label,parameters:samples[0],variants:{practice:samples[1],assessment:samples[2]}};
 return {templateId,curriculumCode,mode,label,group:index<=3?'G1':index<=6?'G2':'G3',schema:geometryDataSchemas[mode],example};
});
export const geometryFieldLabels={legA:'Cạnh góc vuông AB',legB:'Cạnh góc vuông AC',angleAt:'Góc đang xét',target:'Vai trò cạnh cần chọn',ratio:'Tỉ số cần tính',unit:'Đơn vị',radius:'Bán kính ngoài / đường tròn O',radius2:'Bán kính đường tròn K',distance:'Khoảng cách tới tâm / giữa hai tâm',pointDistance:'Khoảng cách OP',pointAngle:'Góc đặt điểm P (độ)',axis:'Trục phản xạ',normalAngle:'Góc pháp tuyến đường thẳng (độ)',sweep:'Góc ở tâm chắn cung (độ)',innerRadius:'Bán kính trong',measure:'Đại lượng cần tính',sideA:'Cạnh a = BC',sideB:'Cạnh b = CA',sideC:'Cạnh c = AB',construction:'Đường tròn cần dựng',shape:'Loại đa giác',vertices:'Số đỉnh đa giác đều',angleB:'Góc cực đỉnh B (độ)',angleC:'Góc cực đỉnh C (độ)',angleD:'Góc cực đỉnh D (độ)'};
