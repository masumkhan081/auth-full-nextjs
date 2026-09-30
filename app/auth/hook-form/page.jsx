"use client";
import { useForm } from "react-hook-form"
import Input from "../../../components/Input"

export default function HookFormPage() {


  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const handleUserSubmit = (data) => {
    console.log("name:", data.name)
    console.log("gender:", data.gender)
    console.log("age:", data.age)
    console.log("email:", data.email)
    console.log("password:", data.password)
    console.log("customField:", data.customField)
  }

  return (
    <div className=" flex justify-center items-center h-full w-full  rounded-sm">

      <form
        className=" min-w-50 min-h-50 flex flex-col gap-4 justify-center items-center p-4 rounded-sm border"
        onSubmit={handleSubmit(handleUserSubmit)}>

        <input className="p-2 rounded border" defaultValue="Mk2222..." {...register("name", { maxLength: 100, minLength: 2 })} placeholder="Name" />



        <select className="w-full p-2 rounded border" {...register("gender")}>
          <option value="female">female</option>
          <option value="male">male</option>
          <option value="other">other</option>
        </select>

        <input type="number" className="p-2 rounded border" defaultValue="" {...register("age", { min: 18, max: 99 })} placeholder="Age" />

        <input className="p-2 rounded border" defaultValue="" {...register("email", { required: true })} placeholder="Email" />
        {errors.email && <span className="w-full text-red-700">This field is required</span>}

        <input className="p-2 rounded border" defaultValue="" {...register("password")} placeholder="Password" />

        <Input
          label="Custom RHF field"
          type="text"
          ph="Registered with React Hook Form"
          id="customField"
          error={errors.customField && "This field is required"}
          registration={register("customField", { required: true })}
        />

        <input type="submit" />

      </form>

    </div>
  );
}
