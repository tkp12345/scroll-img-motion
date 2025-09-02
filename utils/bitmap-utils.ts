export type Bitmap =  ImageBitmap | HTMLImageElement

/*
 URL에서 이미지를 받아
 1. ImageBitmap 으로,
 2. 지원 안 되면 HTMLImageElement 로
 캔버스 등에 바로 그릴 수 있게 반환.
 */

// 한 번의 시도로 이미지를 불러와 디코딩하는 함수.
async function fetchBitmap ( url : string , signal?:AbortSignal) :Promise<Bitmap> {
     const res = await  fetch(url , {signal, credentials:"omit", cache:"force-cache"})
     if(!res.ok) throw new Error
     const blob = await res.blob()

     //브라우저가 createImageBitmap 지원하면, 그걸 사용해 고성능 ImageBitmap 생성.
     if("createImageBitmap" in window &&  typeof createImageBitmap === "function"){
          return await  createImageBitmap(blob)
     }

     //지원하지 않으면 HTML <img> 객체 생성
     return await  blobToImage(blob,signal)
}

/*
 blob 객체를 <img> 로 변환
 */
function blobToImage(blob : Blob , signal?: AbortSignal) : Promise<HTMLImageElement>{
     return new Promise((resolve,reject)=>{

          const objUrl = URL.createObjectURL(blob);
          const img = new Image();

          //CORS 안전하게 불러오기
          img.crossOrigin = "anoymous";
          //이미지 디코딩을 비동기로 하여 성능 최적화
          img.decoding = "async"

          const cleanup =()=>{ URL.revokeObjectURL(objUrl); signal?.removeEventListener("abort",onAbort)}
          const onAbort =()=>{ cleanup(); reject(new DOMException("Aborted","AbortError")); };

          signal?.addEventListener("abort", onAbort, {once:true});
          img.onload = ()=> {cleanup(); resolve(img);}
          img.onerror = (e)=>{cleanup(); reject(e);};
          img.src = objUrl;
     })
}

export async function fetchBitmapWithFallback(url:string, signal?:AbortSignal):Promise<Bitmap>{
     try{
          return await fetchBitmap(url, signal)
     }catch {
          if(url.endsWith(".webp")){
               const jpg = url.slice(0,-5) + ".jpg";
               return await fetchBitmap(jpg, signal);
          }
          throw new Error
     }
}


