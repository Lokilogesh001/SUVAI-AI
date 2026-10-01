
import { useLanguage, languages } from "@/contexts/LanguageContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ProfileLanguageSettings = () => {
  const { currentLanguage, setLanguage, t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("profile.language")}</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup 
          value={currentLanguage} 
          onValueChange={(value) => setLanguage(value as any)}
          className="space-y-3"
        >
          {languages.map((lang) => (
            <div key={lang.code} className="flex items-center space-x-2">
              <RadioGroupItem value={lang.code} id={`lang-${lang.code}`} />
              <Label htmlFor={`lang-${lang.code}`} className="flex-1 cursor-pointer">
                {lang.nativeName} <span className="text-muted-foreground">({lang.name})</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default ProfileLanguageSettings;
