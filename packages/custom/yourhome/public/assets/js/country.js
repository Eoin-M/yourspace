var countryMap = new Array();
countryMap["United States"]="us";
countryMap["Argentina"]="ar";
countryMap["Australia"]="au";
countryMap["Austria"]="at";
countryMap["Bahrain"]="bh";
countryMap["Belgium"]="be";
countryMap["Brazil"]="br";
countryMap["Canada"]="ca";
countryMap["Chile"]="cl";
countryMap["China"]="cn";
countryMap["Colombia"]="co";
countryMap["Czech republic"]="cz";
countryMap["Denmark"]="dk";
countryMap["Finland"]="fi";
countryMap["France"]="fr";
countryMap["Germany"]="de";
countryMap["Greece"]="gr";
countryMap["Hong Kong"]="hk";
countryMap["Hungary"]="hu";
countryMap["India"]="in";
countryMap["Indonesia"]="id";
countryMap["Ireland"]="ie";
countryMap["Israel"]="il";
countryMap["Italy"]="it";
countryMap["Japan"]="jp";
countryMap["Korea"]="kr";
countryMap["Kuwait"]="kw";
countryMap["Luxembourg"]="lu";
countryMap["Malaysia"]="my";
countryMap["Mexico"]="mx";
countryMap["Netherlands"]="nl";
countryMap["New Zealand"]="nz";
countryMap["Norway"]="no";
countryMap["Oman"]="om";
countryMap["Pakistan"]="pk";
countryMap["Peru"]="pe";
countryMap["Philippines"]="ph";
countryMap["Poland"]="pl";
countryMap["Portugal"]="pt";
countryMap["Qatar"]="qa";
countryMap["Romania"]="ro";
countryMap["Russia"]="ru";
countryMap["Saudi Arabia"]="sa";
countryMap["Singapore"]="sg";
countryMap["South Africa"]="za";
countryMap["Spain"]="es";
countryMap["Sweden"]="se";
countryMap["Switzerland"]="ch";
countryMap["Taiwan"]="tw";
countryMap["Turkey"]="tr";
countryMap["United Arab Emirates"]="ae";
countryMap["United Kingdom"]="gb";
countryMap["Venezuela"]="ve";

function getIndexOfCountry(value){
	for(var key in countryMap)
	{
		if(countryMap[key]==value) return (key);
	}
	return -1;
}