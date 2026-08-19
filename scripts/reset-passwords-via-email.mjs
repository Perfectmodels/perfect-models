const ACCOUNTS = [
  {"login_email":"arselia@perfectmodels.online","identifier":"Man-PMMG01","app_role":"student","profile_id":"16"},
  {"login_email":"noe@perfectmodels.online","identifier":"Man-PMMN04","app_role":"student","profile_id":"34"},
  {"login_email":"ruth@perfectmodels.online","identifier":"Man-PMMN01","app_role":"student","profile_id":"36"},
  {"login_email":"enregistrement1@perfectmodels.online","identifier":"enregistrement1","app_role":"registration","profile_id":"reg1"},
  {"login_email":"nahoumie@perfectmodels.online","identifier":"Man-PMMN05","app_role":"student","profile_id":"31"},
  {"login_email":"styna@perfectmodels.online","identifier":"Man-PMMS07","app_role":"student","profile_id":"50"},
  {"login_email":"lea@perfectmodels.online","identifier":"Man-PMME01","app_role":"student","profile_id":"14"},
  {"login_email":"jury4@perfectmodels.online","identifier":"jury4","app_role":"jury","profile_id":"jury4"},
  {"login_email":"moustapha@perfectmodels.online","identifier":"Man-PMMM04","app_role":"student","profile_id":"30"},
  {"login_email":"samantha@perfectmodels.online","identifier":"Man-PMMS03","app_role":"student","profile_id":"44"},
  {"login_email":"admin@perfectmodels.online","identifier":"admin","app_role":"admin","profile_id":"admin"},
  {"login_email":"shon@perfectmodels.online","identifier":"Man-PMMS08","app_role":"student","profile_id":"47"},
  {"login_email":"laure@perfectmodels.online","identifier":"Man-PMML04","app_role":"student","profile_id":"23"},
  {"login_email":"diane@perfectmodels.online","identifier":"Man-PMMD06","app_role":"student","profile_id":"10"},
  {"login_email":"christy@perfectmodels.online","identifier":"Man-PMMC04","app_role":"student","profile_id":"9"},
  {"login_email":"sadia@perfectmodels.online","identifier":"Man-PMMB01","app_role":"student","profile_id":"4"},
  {"login_email":"sarah@perfectmodels.online","identifier":"Man-PMMS04","app_role":"student","profile_id":"45"},
  {"login_email":"enregistrement3@perfectmodels.online","identifier":"enregistrement3","app_role":"registration","profile_id":"reg3"},
  {"login_email":"jury1@perfectmodels.online","identifier":"jury1","app_role":"jury","profile_id":"jury1"},
  {"login_email":"doria@perfectmodels.online","identifier":"Man-PMMD04","app_role":"student","profile_id":"13"},
  {"login_email":"stephie@perfectmodels.online","identifier":"Man-PMMS06","app_role":"student","profile_id":"49"},
  {"login_email":"enregistrement2@perfectmodels.online","identifier":"enregistrement2","app_role":"registration","profile_id":"reg2"},
  {"login_email":"aj@perfectmodels.online","identifier":"Man-PMMA04","app_role":"student","profile_id":"0"},
  {"login_email":"latifa@perfectmodels.online","identifier":"Man-PMMM02","app_role":"student","profile_id":"29"},
  {"login_email":"lorielna@perfectmodels.online","identifier":"Man-PMML02","app_role":"student","profile_id":"25"},
  {"login_email":"raida@perfectmodels.online","identifier":"Man-PMMR02","app_role":"student","profile_id":"38"},
  {"login_email":"kevine@perfectmodels.online","identifier":"Man-PMMK04","app_role":"student","profile_id":"20"},
  {"login_email":"raina@perfectmodels.online","identifier":"Man-PMMR06","app_role":"student","profile_id":"39"},
  {"login_email":"osee@perfectmodels.online","identifier":"Man-PMMO02","app_role":"student","profile_id":"37"},
  {"login_email":"ursula@perfectmodels.online","identifier":"Man-PMMU01","app_role":"student","profile_id":"51"},
  {"login_email":"cegolaine@perfectmodels.online","identifier":"Man-PMMC02","app_role":"student","profile_id":"7"},
  {"login_email":"ruth.ella@perfectmodels.online","identifier":"Man-PMMR01","app_role":"student","profile_id":"43"},
  {"login_email":"donatien@perfectmodels.online","identifier":"Man-PMMA03","app_role":"student","profile_id":"1"},
  {"login_email":"ruth.danicia@perfectmodels.online","identifier":"Man-PMMR07","app_role":"student","profile_id":"42"},
  {"login_email":"jury3@perfectmodels.online","identifier":"jury3","app_role":"jury","profile_id":"jury3"},
  {"login_email":"raiva@perfectmodels.online","identifier":"Man-PMMR05","app_role":"student","profile_id":"40"},
  {"login_email":"marisca@perfectmodels.online","identifier":"Man-PMMM08","app_role":"student","profile_id":"28"},
  {"login_email":"lesly@perfectmodels.online","identifier":"Man-PMML01","app_role":"student","profile_id":"24"},
  {"login_email":"annie@perfectmodels.online","identifier":"Man-PMMA02","app_role":"student","profile_id":"3"},
  {"login_email":"diane.vanessa@perfectmodels.online","identifier":"Man-PMMD01","app_role":"student","profile_id":"11"},
  {"login_email":"nelly@perfectmodels.online","identifier":"Man-PMMN07","app_role":"student","profile_id":"33"},
  {"login_email":"blanche@perfectmodels.online","identifier":"Man-PMMB02","app_role":"student","profile_id":"5"},
  {"login_email":"esther@perfectmodels.online","identifier":"Man-PMME04","app_role":"student","profile_id":"15"},
  {"login_email":"noemi@perfectmodels.online","identifier":"Man-PMMN03","app_role":"student","profile_id":"35"},
  {"login_email":"enregistrement4@perfectmodels.online","identifier":"enregistrement4","app_role":"registration","profile_id":"reg4"},
  {"login_email":"dorcas@perfectmodels.online","identifier":"Man-PMMD02","app_role":"student","profile_id":"12"},
  {"login_email":"chafyda@perfectmodels.online","identifier":"Man-PMMC03","app_role":"student","profile_id":"8"},
  {"login_email":"sephora@perfectmodels.online","identifier":"Man-PMMS01","app_role":"student","profile_id":"46"},
  {"login_email":"jury2@perfectmodels.online","identifier":"jury2","app_role":"jury","profile_id":"jury2"},
  {"login_email":"anne@perfectmodels.online","identifier":"Man-PMMA12","app_role":"student","profile_id":"2"},
  {"login_email":"asnath@perfectmodels.online","identifier":"Man-PMMK05","app_role":"student","profile_id":"22"},
  {"login_email":"lucresse@perfectmodels.online","identifier":"Man-PMML05","app_role":"student","profile_id":"26"},
  {"login_email":"maira@perfectmodels.online","identifier":"Man-PMMM07","app_role":"student","profile_id":"27"},
  {"login_email":"hawa@perfectmodels.online","identifier":"Man-PMMH02","app_role":"student","profile_id":"17"},
  {"login_email":"khelany@perfectmodels.online","identifier":"Man-PMMK01","app_role":"student","profile_id":"21"},
  {"login_email":"cassandra@perfectmodels.online","identifier":"Man-PMMC01","app_role":"student","profile_id":"6"},
  {"login_email":"rosly@perfectmodels.online","identifier":"Man-PMMR03","app_role":"student","profile_id":"41"},
  {"login_email":"kendra@perfectmodels.online","identifier":"Man-PMMK02","app_role":"student","profile_id":"19"},
  {"login_email":"stecy@perfectmodels.online","identifier":"Man-PMMS02","app_role":"student","profile_id":"48"},
  {"login_email":"dousca@perfectmodels.online","identifier":"Man-PMMK03","app_role":"student","profile_id":"18"},
  {"login_email":"brice@perfectmodels.online","identifier":"Man-PMMN06","app_role":"student","profile_id":"32"},
];

async function main() {
  console.log('[reset-passwords] marking all accounts as must_change_password=true and triggering reset emails...\n');

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const account of ACCOUNTS) {
    const email = String(account.login_email || '').toLowerCase();
    const identifier = String(account.identifier || '');

    if (!email) {
      skipped++;
      continue;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/forget-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, redirectTo: 'http://localhost:3000/login' }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`[reset-passwords] failed for ${email}: ${response.status} ${errorText}`);
        errors++;
        continue;
      }

      console.log(`[reset-passwords] ✓ reset email sent: ${email} (${identifier})`);
      updated++;
    } catch (err) {
      errors++;
      console.error(`[reset-passwords] ✗ error for ${email}:`, err.message || err);
    }
  }

  console.log(`\n[reset-passwords] summary: ${updated} emails sent, ${skipped} skipped, ${errors} errors`);
  console.log('\n[reset-passwords] NOTE: users must click the reset link in their email to set a new password.');
  console.log('[reset-passwords] The app will force password change on next login if mustChangePassword=true in DB.');
}

main().catch((err) => {
  console.error('[reset-passwords] fatal:', err);
  process.exit(1);
});
