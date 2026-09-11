## Løsning

### Tilføjelser

- Jeg har lavet en funktion der udregner status fra en sag, der bl.a. returnerer hovedstol, renten og summen debitor skylder.
- Frontend: Skema der viser tallene inden under hver sag
- Unit test med Vitest der tjekker
    - Ophobning af rente selv med skift af rentesats undervejs
    - Betalinger dækker renten, før hovedstol
    - Betalinger på sager med flere hovedstole
- Zod validering på API kald, for robusthed og håndtering af fejlmeddelelser
- Mulighed for at slette vouchers

### Ændringer

- Constraints i voucher tabellen, der overholder simple regler og sikrer dataintegritet
- Forbedret UI ved Add voucher, der nu kun viser de relevante felter for valgt voucher type
- Ændret dato-visning fra ISO strings til mere læsbart YYYY-MM-DD

## Refleksioner

### Hvilke edge case eller problemer har du lagt mærke til som du ikke nåede at håndtere?

Her er nogle forretningsregler edge cases der skal løses i Servicen for API kaldene:

- Lige nu kan man tilføje interest vouchers på tværs af sager.
- Man kan tilføje en interest rate der starter før den valgte principal voucher.
- Man kan betale mere end man skylder. 

### Hvad ville du gøre for at gøre løsningen produktionsklar? Tænk både på din egen kode og det udleverede projekt.

For at gøre Applikationen produktionsklar er der et par vigtige punkter:

- Authentication: En form for log ind system med roles/permissions, noget der tjekker at det kun er de rigtige personer der har adgang til de fortrolige data på siden
- Tilføje .env til passwords og credentials; + Brug af Secrets (fx Github Secrets) til CI/CD
- Tjekke alle pakkerne for vulnerabilities, og holde dem opdateret (evt. med dependabot). I opgaven har jeg startet ud med at køre `npm audit fix`

Disse er måske lidt mere Quality of Life:

- Navngivning på Principal vouchers der gør det nemmere at referere til dem (fx når man skal tilknytte en interest voucher)
- I seedet har Cases referencerne "SAG-001, SAG-002 ...", Her bør man have regler der tvinger til ensformighed
- Bedre fejlmeddelelser i UI efter Zod implementationen (Det kan godt blive mere tydligere og markere hvilket input field den er gal med).
- Et arkiv system der gemmer de cases der er færdige/betalt.

### Er der beslutninger i din løsning du var i tvivl om? Hvad overvejede du?

Jeg var i tvivl om det ville være lettere overskueligt for sagsbehandler at have én Hovedstol per Case. Selvom det umiddelbart ville gøre UI'et nemmere læsbart, ville det gøre det enormt besværligt i andre sammenhænge. Derfor blev løsningen flere Hovedstole under samme case:

- Fordeling af betalinger: Når debitor betaler, betaler de af på en af Hovedstolene af gangen, og hopper direkte hen til næste Hovedstol når den forrige er betalt.
- Det er bedre at have Hovedstolene samlet, så sagsbehandler ikke behøver unødvendige ekstra omkostninger ved oprettelse af flere Cases

Jeg overvejede også om en Hovedstol kunne have flere rentesatser, og vurderede, at gav bedst mening, at renten kan ændre sig henover tid. Derfor er løsningen bygget op, så man opretter en ny interest voucher for at opdatere renten på en given hovedstol.