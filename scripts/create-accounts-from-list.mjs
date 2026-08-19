const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBawZl4SJz7drhzIrG0dnazSglyF6vmKCg',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://perfect-156b5-default-rtdb.firebaseio.com',
};

const AUTH_BASE = 'https://identitytoolkit.googleapis.com/v1';

async function firebaseRequest(path, body) {
  const url = new URL(`${AUTH_BASE}/${path}?key=${encodeURIComponent(config.apiKey)}`);
  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(`Firebase Auth ${path} failed: ${data?.error?.message || response.status}`);
    error.status = response.status;
    error.body = data;
    throw error;
  }
  return data;
}

async function firebaseDatabaseGet(path) {
  const cleanPath = path.replace(/^\/+|\/+$/g, '');
  const url = new URL(`${config.databaseURL}/${cleanPath}.json`);
  const response = await fetch(url, { cache: 'no-store' });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(`Firebase Realtime Database GET ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

async function firebaseDatabasePut(path, value) {
  const cleanPath = path.replace(/^\/+|\/+$/g, '');
  const url = new URL(`${config.databaseURL}/${cleanPath}.json`);
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
    cache: 'no-store',
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(`Firebase Realtime Database PUT ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

const ACCOUNTS = [
  {"user_id":"01cdad1e-d1a8-59db-a3f2-9d79af190595","identifier":"Man-PMMG01","app_role":"student","login_email":"arselia@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"16","permissions":{},"contest_id":null},
  {"user_id":"1010b6c9-069d-50b5-b5cd-af2aef3e2c20","identifier":"Man-PMMN04","app_role":"student","login_email":"noe@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"34","permissions":{},"contest_id":null},
  {"user_id":"1197e431-9d49-5509-824a-5203cbf1a1ff","identifier":"Man-PMMN01","app_role":"student","login_email":"ruth@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"36","permissions":{},"contest_id":null},
  {"user_id":"12e19e09-3cce-5e1b-9c11-22026d8bd87d","identifier":"enregistrement1","app_role":"registration","login_email":"enregistrement1@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"reg1","permissions":{},"contest_id":null},
  {"user_id":"1cce63f2-727a-5176-aeed-adb4796f7d9f","identifier":"Man-PMMN05","app_role":"student","login_email":"nahoumie@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"31","permissions":{},"contest_id":null},
  {"user_id":"1f174701-7942-5a87-9a0e-0acac92091af","identifier":"Man-PMMS07","app_role":"student","login_email":"styna@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"50","permissions":{},"contest_id":null},
  {"user_id":"2ac88941-1e4d-5df0-86fa-90b2da0bb01e","identifier":"Man-PMME01","app_role":"student","login_email":"lea@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"14","permissions":{},"contest_id":null},
  {"user_id":"2b2ae7e7-2c6b-5a37-9a52-04353d3bb86d","identifier":"jury4","app_role":"jury","login_email":"jury4@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"jury4","permissions":{},"contest_id":null},
  {"user_id":"2ba478ff-cec9-561c-a015-4fbc8dbf0024","identifier":"Man-PMMM04","app_role":"student","login_email":"moustapha@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"30","permissions":{},"contest_id":null},
  {"user_id":"306b0ce4-9efe-50c7-86c7-a5cff08c0b4a","identifier":"Man-PMMS03","app_role":"student","login_email":"samantha@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"44","permissions":{},"contest_id":null},
  {"user_id":"40677c5a-6f11-5a1c-8276-c4aa1cd97e95","identifier":"admin","app_role":"admin","login_email":"admin@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"admin","permissions":{},"contest_id":null},
  {"user_id":"4161ca24-ce7e-5d67-8d6a-fcb378295d3b","identifier":"Man-PMMS08","app_role":"student","login_email":"shon@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"47","permissions":{},"contest_id":null},
  {"user_id":"496288af-543a-5b2d-998c-904015155870","identifier":"Man-PMML04","app_role":"student","login_email":"laure@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"23","permissions":{},"contest_id":null},
  {"user_id":"497fa6bf-fd1e-5444-bbe6-6a1005937d89","identifier":"Man-PMMD06","app_role":"student","login_email":"diane@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"10","permissions":{},"contest_id":null},
  {"user_id":"4addf77d-285b-5a4a-b510-c6552715efac","identifier":"Man-PMMC04","app_role":"student","login_email":"christy@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"9","permissions":{},"contest_id":null},
  {"user_id":"4de928fe-fb7b-528d-ac07-c4937166ef50","identifier":"Man-PMMB01","app_role":"student","login_email":"sadia@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"4","permissions":{},"contest_id":null},
  {"user_id":"51e31dae-ae28-518d-bd70-b69703a38004","identifier":"Man-PMMS04","app_role":"student","login_email":"sarah@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"45","permissions":{},"contest_id":null},
  {"user_id":"53f6e333-64b3-5272-8f42-d64365661115","identifier":"enregistrement3","app_role":"registration","login_email":"enregistrement3@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"reg3","permissions":{},"contest_id":null},
  {"user_id":"5a494770-b46c-5906-a6dd-2b06e1e37a26","identifier":"jury1","app_role":"jury","login_email":"jury1@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"jury1","permissions":{},"contest_id":null},
  {"user_id":"5e37d59f-5bb4-50e8-b9f0-4ac88a2773f8","identifier":"Man-PMMD04","app_role":"student","login_email":"doria@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"13","permissions":{},"contest_id":null},
  {"user_id":"5f8a3e00-e478-5e08-9b83-10b5552e3db0","identifier":"Man-PMMS06","app_role":"student","login_email":"stephie@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"49","permissions":{},"contest_id":null},
  {"user_id":"60ed66b4-66a1-5f0c-bfc8-35f610ac564b","identifier":"enregistrement2","app_role":"registration","login_email":"enregistrement2@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"reg2","permissions":{},"contest_id":null},
  {"user_id":"6342e962-a4c6-5aec-8e65-347f3d0a84e2","identifier":"Man-PMMA04","app_role":"student","login_email":"aj@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:26:22.63718+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"0","permissions":{},"contest_id":null},
  {"user_id":"6662fb99-ad8b-50e2-93ca-cfeae56089d8","identifier":"Man-PMMM02","app_role":"student","login_email":"latifa@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"29","permissions":{},"contest_id":null},
  {"user_id":"6893d002-7e86-5d46-9818-b6651f1208cf","identifier":"Man-PMML02","app_role":"student","login_email":"lorielna@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"25","permissions":{},"contest_id":null},
  {"user_id":"6cc0b471-a017-5d8e-ad85-3270836d488f","identifier":"Man-PMMR02","app_role":"student","login_email":"raida@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"38","permissions":{},"contest_id":null},
  {"user_id":"6e948bc4-d711-5f96-957f-1a1ea115f1bb","identifier":"Man-PMMK04","app_role":"student","login_email":"kevine@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"20","permissions":{},"contest_id":null},
  {"user_id":"6f610b7b-685b-5f03-a8b5-4dd2dc97d747","identifier":"Man-PMMR06","app_role":"student","login_email":"raina@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"39","permissions":{},"contest_id":null},
  {"user_id":"703208c5-783e-5e92-8fd5-96256ca267d1","identifier":"Man-PMMO02","app_role":"student","login_email":"osee@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"37","permissions":{},"contest_id":null},
  {"user_id":"70e10f53-3fc2-58d0-ae6e-a070154905e9","identifier":"Man-PMMU01","app_role":"student","login_email":"ursula@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"51","permissions":{},"contest_id":null},
  {"user_id":"71c72b1f-d573-5c68-9f11-150769640ab8","identifier":"Man-PMMC02","app_role":"student","login_email":"cegolaine@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"7","permissions":{},"contest_id":null},
  {"user_id":"7afc32df-af9d-584a-9db2-7665ed2d18f1","identifier":"Man-PMMR01","app_role":"student","login_email":"ruth.ella@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"43","permissions":{},"contest_id":null},
  {"user_id":"7f738384-2f87-5189-8da9-81968c363f6c","identifier":"Man-PMMA03","app_role":"student","login_email":"donatien@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"1","permissions":{},"contest_id":null},
  {"user_id":"81a1f214-2175-59dc-95d8-946dbcd6abc4","identifier":"Man-PMMR07","app_role":"student","login_email":"ruth.danicia@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"42","permissions":{},"contest_id":null},
  {"user_id":"89c8362a-cd98-5514-bf52-7646d26cda33","identifier":"jury3","app_role":"jury","login_email":"jury3@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"jury3","permissions":{},"contest_id":null},
  {"user_id":"8b36956d-99af-5e29-811c-3f626184b04a","identifier":"Man-PMMR05","app_role":"student","login_email":"raiva@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"40","permissions":{},"contest_id":null},
  {"user_id":"8b6bc9b8-5039-5598-88b1-dff82e8281e1","identifier":"Man-PMMM08","app_role":"student","login_email":"marisca@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"28","permissions":{},"contest_id":null},
  {"user_id":"90a5cd3c-42ea-535a-930c-f4b6d7bf3ffb","identifier":"Man-PMML01","app_role":"student","login_email":"lesly@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"24","permissions":{},"contest_id":null},
  {"user_id":"91180309-0ee2-52db-baf3-a5f189167b4e","identifier":"Man-PMMA02","app_role":"student","login_email":"annie@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"3","permissions":{},"contest_id":null},
  {"user_id":"920f2915-b913-50bd-aeae-a49ca8b9734f","identifier":"Man-PMMD01","app_role":"student","login_email":"diane.vanessa@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"11","permissions":{},"contest_id":null},
  {"user_id":"92c686bd-f296-58c1-9959-b65cabf61579","identifier":"Man-PMMN07","app_role":"student","login_email":"nelly@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"33","permissions":{},"contest_id":null},
  {"user_id":"9ca778cd-63e0-5c36-be9f-daed088c3643","identifier":"Man-PMMB02","app_role":"student","login_email":"blanche@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"5","permissions":{},"contest_id":null},
  {"user_id":"a0369922-705a-577a-a32b-d3db81265754","identifier":"Man-PMME04","app_role":"student","login_email":"esther@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"15","permissions":{},"contest_id":null},
  {"user_id":"a2d8fdc2-25d2-5b85-a02a-0e0c26f145dc","identifier":"Man-PMMN03","app_role":"student","login_email":"noemi@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"35","permissions":{},"contest_id":null},
  {"user_id":"a31780d5-5512-56f6-9a44-2913c524d60c","identifier":"enregistrement4","app_role":"registration","login_email":"enregistrement4@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"reg4","permissions":{},"contest_id":null},
  {"user_id":"a4cb9ed3-deda-5f96-91bf-e3d232f79b7d","identifier":"Man-PMMD02","app_role":"student","login_email":"dorcas@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"12","permissions":{},"contest_id":null},
  {"user_id":"af26326c-1a1a-5f24-9810-7330cf188fc7","identifier":"Man-PMMC03","app_role":"student","login_email":"chafyda@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"8","permissions":{},"contest_id":null},
  {"user_id":"ba83cb9e-447b-53ca-bb36-6f2139535734","identifier":"Man-PMMS01","app_role":"student","login_email":"sephora@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"46","permissions":{},"contest_id":null},
  {"user_id":"bbaf5267-9ccc-5707-8b36-3d3d1f71895b","identifier":"jury2","app_role":"jury","login_email":"jury2@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"jury2","permissions":{},"contest_id":null},
  {"user_id":"c108f42d-703a-53e1-880f-7d7bb5912046","identifier":"Man-PMMA12","app_role":"student","login_email":"anne@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"2","permissions":{},"contest_id":null},
  {"user_id":"c363c401-b9ea-59fe-8444-36919a05e77c","identifier":"Man-PMMK05","app_role":"student","login_email":"asnath@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"22","permissions":{},"contest_id":null},
  {"user_id":"cf26d9be-5a61-5683-856a-c3cf88f51375","identifier":"Man-PMML05","app_role":"student","login_email":"lucresse@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"26","permissions":{},"contest_id":null},
  {"user_id":"d1750580-9133-5184-a6c8-2f6cce670349","identifier":"Man-PMMM07","app_role":"student","login_email":"maira@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"27","permissions":{},"contest_id":null},
  {"user_id":"d4b79f27-30d6-5c39-8c24-8b3f5efe1e52","identifier":"Man-PMMH02","app_role":"student","login_email":"hawa@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"17","permissions":{},"contest_id":null},
  {"user_id":"d553db00-2a67-596a-bdfa-1152ff74f608","identifier":"Man-PMMK01","app_role":"student","login_email":"khelany@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"21","permissions":{},"contest_id":null},
  {"user_id":"d6cbdadd-1d89-547a-aae2-3b1735b6d34c","identifier":"Man-PMMC01","app_role":"student","login_email":"cassandra@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"6","permissions":{},"contest_id":null},
  {"user_id":"db32e03f-c01c-57e5-96f9-85389613fc5a","identifier":"Man-PMMR03","app_role":"student","login_email":"rosly@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"41","permissions":{},"contest_id":null},
  {"user_id":"e1cf9e5d-7c5b-5f5d-938a-c7dd4ae88f0c","identifier":"Man-PMMK02","app_role":"student","login_email":"kendra@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"19","permissions":{},"contest_id":null},
  {"user_id":"e26d855b-ea1e-5b73-934d-76cd038b796a","identifier":"Man-PMMS02","app_role":"student","login_email":"stecy@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"48","permissions":{},"contest_id":null},
  {"user_id":"e5ba0535-840a-576d-83bf-27681b892525","identifier":"Man-PMMK03","app_role":"student","login_email":"dousca@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"18","permissions":{},"contest_id":null},
  {"user_id":"f0494615-fe4c-52ad-816a-02d7676407c6","identifier":"Man-PMMN06","app_role":"student","login_email":"brice@perfectmodels.online","must_change_password":false,"status":"active","source":"firebase-migration","created_at":"2026-08-09 00:27:50.77614+00","updated_at":"2026-08-09 18:48:33.321843+00","profile_id":"32","permissions":{},"contest_id":null},
];

async function main() {
  const newPassword = 'Pmm2026@';
  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const account of ACCOUNTS) {
    const email = String(account.login_email || '').toLowerCase();
    const uid = String(account.user_id || '');
    const identifier = String(account.identifier || '');
    const appRole = String(account.app_role || 'student');
    const profileId = String(account.profile_id || uid);

    if (!email || !uid) {
      console.log(`[create-accounts] skipping invalid account: ${JSON.stringify(account)}`);
      skipped++;
      continue;
    }

    try {
      console.log(`[create-accounts] creating ${email} (${identifier})...`);

      const result = await firebaseRequest('accounts:signUp', {
        email,
        password: newPassword,
        displayName: identifier,
        returnSecureToken: true,
      });

      const authUid = String(result.localId || '');
      if (!authUid) {
        console.log(`[create-accounts] failed for ${email}: no UID returned`);
        errors++;
        continue;
      }

      const profile = {
        id: authUid,
        uid: authUid,
        email,
        name: identifier,
        identifier,
        role: appRole,
        profileId,
        status: 'active',
        mustChangePassword: false,
        permissions: appRole === 'admin' ? { all: true, isAdmin: true } : { isActive: true },
        contestId: account.contest_id ? String(account.contest_id) : null,
        source: 'firebase-migration',
        createdAt: account.created_at || new Date().toISOString(),
      };

      await firebaseDatabasePut(`users/${authUid}`, profile);

      if (appRole === 'student') {
        const modelRecord = {
          id: profileId,
          authUserId: authUid,
          firebaseUid: authUid,
          email,
          name: identifier,
          username: identifier,
          loginEmail: email,
          identifier,
          role: 'student',
          status: 'active',
        };
        await firebaseDatabasePut(`models/${profileId}`, modelRecord);
      }

      console.log(`[create-accounts] ✓ created ${email} -> ${authUid}`);
      created++;
    } catch (err) {
      errors++;
      console.error(`[create-accounts] ✗ failed for ${email}:`, err.message || err);
    }
  }

  console.log(`\n[create-accounts] summary: ${created} created, ${skipped} skipped, ${errors} errors`);
}

main().catch((err) => {
  console.error('[create-accounts] fatal:', err);
  process.exit(1);
});
