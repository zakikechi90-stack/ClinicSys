"use client"

import { useState } from "react"
import { Send, ShieldCheck } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { toast } from "sonner"
import { sendPatientMessage } from "@/src/lib/actions/patient-messages"

export function ContactDoctor() {
  const [loading, setLoading] = useState(false)
  const [captchaChecked, setCaptchaChecked] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!captchaChecked) {
      toast.error("Veuillez confirmer que vous n'êtes pas un robot.")
      return
    }

    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await sendPatientMessage(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Message envoyé avec succès à votre médecin.")
        ;(e.target as HTMLFormElement).reset()
        setCaptchaChecked(false)
      }
    } catch (err) {
      toast.error("Une erreur est survenue.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl w-full border border-border/40 bg-white/60 dark:bg-card/60 backdrop-blur-xl p-8 rounded-2xl shadow-xl">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Message Your Doctor</h2>
        <p className="text-sm text-muted-foreground">Envoyez une mise à jour ou posez une question simple à votre médecin (résultats d'analyses, suivi).</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom</Label>
            <Input id="firstName" name="firstName" required placeholder="Votre prénom" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom</Label>
            <Input id="lastName" name="lastName" required placeholder="Votre nom" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dob">Date de naissance</Label>
            <Input id="dob" name="dob" type="date" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Numéro de téléphone</Label>
            <Input id="phone" name="phone" required placeholder="Ex: 0550000000" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="doctorEmail">Email du médecin</Label>
          <Input id="doctorEmail" name="doctorEmail" type="email" required placeholder="email.medecin@clinicsys.com" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea 
            id="message" 
            name="message" 
            required 
            placeholder="Ex: J'ai terminé mes analyses et j'ai reçu les résultats..."
            className="min-h-[100px] resize-y"
          />
        </div>

        <div className="flex items-center gap-3 p-3 bg-muted/30 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setCaptchaChecked(!captchaChecked)}>
          <div className={`w-5 h-5 rounded border flex items-center justify-center ${captchaChecked ? 'bg-primary border-primary text-white' : 'border-input bg-background'}`}>
            {captchaChecked && <ShieldCheck className="w-3.5 h-3.5" />}
          </div>
          <span className="text-sm font-medium select-none text-foreground">Je ne suis pas un robot</span>
        </div>

        <Button type="submit" className="w-full gap-2 mt-4" disabled={loading}>
          <Send className="w-4 h-4" />
          {loading ? "Envoi en cours..." : "Envoyer le message"}
        </Button>
      </form>
    </div>
  )
}
